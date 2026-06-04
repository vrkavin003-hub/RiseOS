import { Router } from 'express';
import { body } from 'express-validator';
import Friend from '../models/Friend.js';
import FriendRequest from '../models/FriendRequest.js';
import Status from '../models/Status.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createNotification } from '../services/notificationService.js';
import { emitToUser } from '../services/realtime.js';
import { cleanObject } from '../utils/sanitize.js';

const router = Router();
const statusUserFields = 'name profession profilePhoto privacySettings';

function sameId(first, second) {
  return String(first) === String(second);
}

async function getFriendIds(userId) {
  const [friends, acceptedRequests] = await Promise.all([
    Friend.find({ users: userId }).select('users'),
    FriendRequest.find({
      status: 'accepted',
      $or: [{ from: userId }, { to: userId }],
    }).select('from to'),
  ]);

  const ids = new Set();

  friends.forEach((friend) => {
    friend.users.forEach((friendUserId) => {
      if (!sameId(friendUserId, userId)) ids.add(String(friendUserId));
    });
  });

  acceptedRequests.forEach((connection) => {
    ids.add(sameId(connection.from, userId) ? String(connection.to) : String(connection.from));
  });

  return [...ids];
}

function canViewStatus(status, viewerId, friendIds) {
  const ownerId = String(status.user?._id || status.user);
  if (sameId(ownerId, viewerId)) return true;
  if (status.privacy === 'private') return false;
  if (status.privacy === 'public') return true;
  return friendIds.includes(ownerId);
}

function shapeStatus(status, viewerId) {
  const item = status.toObject();
  item.isMine = sameId(item.user?._id || item.user, viewerId);
  item.viewCount = item.views?.length || 0;
  item.viewedByMe = item.views?.some((view) => sameId(view, viewerId)) || item.isMine;
  return item;
}

const statusValidators = [
  body('text').optional({ checkFalsy: true }).trim().isLength({ max: 280 }).withMessage('Status text must be 280 characters or less'),
  body('imageUrl').optional({ checkFalsy: true }).trim().isLength({ max: 1_500_000 }).withMessage('Status image is too large'),
  body('privacy').optional().isIn(['public', 'friends', 'private']).withMessage('Invalid status privacy'),
];

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const friendIds = await getFriendIds(req.user._id);
    const statuses = await Status.find({ expiresAt: { $gt: new Date() } })
      .populate('user', statusUserFields)
      .sort({ createdAt: -1 });

    const items = statuses
      .filter((status) => canViewStatus(status, req.user._id, friendIds))
      .map((status) => shapeStatus(status, req.user._id));

    res.json({ items });
  }),
);

router.post(
  '/',
  requireAuth,
  statusValidators,
  validate,
  asyncHandler(async (req, res) => {
    if (!req.body.text && !req.body.imageUrl) {
      return res.status(422).json({ message: 'Status requires text or an image' });
    }

    const privacy = req.body.privacy || req.user.privacySettings?.statusVisibility || 'friends';
    const item = await Status.create({
      ...cleanObject(req.body),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      privacy,
      user: req.user._id,
    });

    const friendIds = await getFriendIds(req.user._id);
    await Promise.all(
      friendIds.map(async (friendId) => {
        await createNotification({
          body: `${req.user.name} posted a new status.`,
          title: 'New status update',
          type: 'status',
          user: friendId,
        });
        emitToUser(friendId, 'status:update', { statusId: item._id });
      }),
    );

    const populated = await item.populate('user', statusUserFields);
    emitToUser(req.user._id, 'status:update', { statusId: item._id });
    res.status(201).json({ item: shapeStatus(populated, req.user._id) });
  }),
);

router.post(
  '/:id/view',
  requireAuth,
  asyncHandler(async (req, res) => {
    const friendIds = await getFriendIds(req.user._id);
    const status = await Status.findOne({ _id: req.params.id, expiresAt: { $gt: new Date() } }).populate('user', statusUserFields);
    if (!status || !canViewStatus(status, req.user._id, friendIds)) return res.status(404).json({ message: 'Status not found' });

    if (!sameId(status.user._id, req.user._id) && !status.views.some((view) => sameId(view, req.user._id))) {
      status.views.push(req.user._id);
      await status.save();
    }

    res.json({ item: shapeStatus(status, req.user._id) });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Status.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Status not found' });
    res.json({ message: 'Deleted' });
  }),
);

export default router;
