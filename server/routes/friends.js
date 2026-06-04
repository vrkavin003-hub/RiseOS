import { Router } from 'express';
import { body, query } from 'express-validator';
import Friend from '../models/Friend.js';
import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createNotification } from '../services/notificationService.js';
import { emitToUser } from '../services/realtime.js';

const router = Router();
const userFields = 'name email profession location profilePhoto privacySettings';

function sameId(first, second) {
  return String(first) === String(second);
}

function buildFriendPair(first, second) {
  const users = [first, second].map((id) => id.toString()).sort();
  return { pairKey: users.join(':'), users };
}

function otherUser(request, userId) {
  return sameId(request.from._id || request.from, userId) ? request.to : request.from;
}

function shapeConnection(request, userId) {
  return {
    _id: request._id,
    createdAt: request.createdAt,
    direction: sameId(request.from._id || request.from, userId) ? 'outgoing' : 'incoming',
    otherUser: otherUser(request, userId),
    status: request.status,
    updatedAt: request.updatedAt,
  };
}

function groupConnections(requests, userId) {
  const shaped = requests.map((request) => shapeConnection(request, userId));

  return {
    accepted: shaped.filter((request) => request.status === 'accepted'),
    incoming: shaped.filter((request) => request.status === 'pending' && request.direction === 'incoming'),
    outgoing: shaped.filter((request) => request.status === 'pending' && request.direction === 'outgoing'),
    recent: shaped.filter((request) => request.status !== 'pending').slice(0, 12),
  };
}

async function findConnections(userId) {
  return FriendRequest.find({
    $or: [{ from: userId }, { to: userId }],
  })
    .populate('from to', userFields)
    .sort({ updatedAt: -1, createdAt: -1 });
}

async function notify(userId, payload) {
  return createNotification({ user: userId, ...payload });
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const requests = await findConnections(req.user._id);
    res.json({ ...groupConnections(requests, req.user._id), items: requests });
  }),
);

router.get(
  '/search',
  requireAuth,
  [query('q').trim().isLength({ min: 2 }).withMessage('Search must be at least 2 characters')],
  validate,
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || '').trim();
    const people = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { profession: new RegExp(q, 'i') }],
    })
      .select(userFields)
      .limit(12);

    const personIds = people.map((person) => person._id);
    const relations = await FriendRequest.find({
      $or: [
        { from: req.user._id, to: { $in: personIds } },
        { from: { $in: personIds }, to: req.user._id },
      ],
    });

    const relationByUser = new Map();
    relations.forEach((relation) => {
      const id = sameId(relation.from, req.user._id) ? relation.to : relation.from;
      relationByUser.set(String(id), {
        direction: sameId(relation.from, req.user._id) ? 'outgoing' : 'incoming',
        requestId: relation._id,
        status: relation.status,
      });
    });

    res.json({
      items: people.map((person) => ({
        ...person.toObject(),
        relation: relationByUser.get(String(person._id)) || null,
      })),
    });
  }),
);

router.post(
  '/request/:userId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const target = await User.findById(req.params.userId);
    if (!target) return res.status(404).json({ message: 'User not found' });
    if (target._id.equals(req.user._id)) return res.status(400).json({ message: 'Cannot friend yourself' });

    const existing = await FriendRequest.findOne({
      $or: [
        { from: req.user._id, to: target._id },
        { from: target._id, to: req.user._id },
      ],
    });

    if (existing?.status === 'accepted') return res.status(409).json({ message: 'You are already connected' });
    if (existing?.status === 'pending' && sameId(existing.from, target._id)) {
      return res.status(409).json({ message: 'This user already sent you a request' });
    }

    const request = existing && sameId(existing.from, req.user._id)
      ? await FriendRequest.findByIdAndUpdate(existing._id, { status: 'pending' }, { new: true })
      : await FriendRequest.create({ from: req.user._id, status: 'pending', to: target._id });

    await notify(target._id, {
      body: `${req.user.name} sent you a friend request.`,
      title: 'New friend request',
      type: 'friend',
    });
    emitToUser(target._id, 'friend:request', { from: req.user.name, requestId: request._id });

    const populated = await request.populate('from to', userFields);
    res.status(201).json({ item: populated });
  }),
);

router.patch(
  '/:id',
  requireAuth,
  [body('status').isIn(['accepted', 'rejected']).withMessage('Status must be accepted or rejected')],
  validate,
  asyncHandler(async (req, res) => {
    const request = await FriendRequest.findOne({ _id: req.params.id, status: 'pending', to: req.user._id });
    if (!request) return res.status(404).json({ message: 'Friend request not found' });

    request.status = req.body.status;
    await request.save();

    if (request.status === 'accepted') {
      const pair = buildFriendPair(request.from, request.to);
      await Friend.findOneAndUpdate(
        { pairKey: pair.pairKey },
        {
          $setOnInsert: {
            acceptedAt: new Date(),
            pairKey: pair.pairKey,
            recipient: request.to,
            request: request._id,
            requester: request.from,
            users: pair.users,
          },
        },
        { new: true, runValidators: true, setDefaultsOnInsert: true, upsert: true },
      );
    }

    await notify(request.from, {
      body: `${req.user.name} ${request.status === 'accepted' ? 'accepted' : 'declined'} your friend request.`,
      title: request.status === 'accepted' ? 'Friend request accepted' : 'Friend request declined',
      type: 'friend',
    });
    emitToUser(request.from, 'friend:update', { requestId: request._id, status: request.status });

    const populated = await request.populate('from to', userFields);
    res.json({ item: populated });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const request = await FriendRequest.findOneAndDelete({ _id: req.params.id, $or: [{ from: req.user._id }, { to: req.user._id }] });
    if (!request) return res.status(404).json({ message: 'Friend connection not found' });

    const pair = buildFriendPair(request.from, request.to);
    await Friend.findOneAndDelete({ pairKey: pair.pairKey });

    const targetId = sameId(request.from, req.user._id) ? request.to : request.from;
    emitToUser(targetId, 'friend:update', { requestId: request._id, status: 'removed' });
    res.json({ message: 'Friend connection removed' });
  }),
);

export default router;
