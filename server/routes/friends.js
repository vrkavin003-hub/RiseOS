import { Router } from 'express';
import FriendRequest from '../models/FriendRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToUser } from '../services/realtime.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    $or: [{ from: req.user._id }, { to: req.user._id }],
  }).populate('from to', 'name email profession profilePhoto');
  res.json({ items: requests });
}));

router.post('/request/:userId', requireAuth, asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.userId);
  if (!target) return res.status(404).json({ message: 'User not found' });
  if (target._id.equals(req.user._id)) return res.status(400).json({ message: 'Cannot friend yourself' });

  const request = await FriendRequest.findOneAndUpdate(
    { from: req.user._id, to: target._id },
    { from: req.user._id, status: 'pending', to: target._id },
    { new: true, upsert: true },
  );

  await Notification.create({ body: `${req.user.name} sent you a friend request.`, title: 'New friend request', type: 'friend', user: target._id });
  emitToUser(target._id, 'friend:request', { from: req.user.name });
  res.status(201).json({ item: request });
}));

router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const request = await FriendRequest.findOneAndUpdate({ _id: req.params.id, to: req.user._id }, { status: req.body.status }, { new: true });
  if (!request) return res.status(404).json({ message: 'Friend request not found' });
  emitToUser(request.from, 'friend:update', { status: request.status });
  res.json({ item: request });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  await FriendRequest.findOneAndDelete({ _id: req.params.id, $or: [{ from: req.user._id }, { to: req.user._id }] });
  res.json({ message: 'Friend connection removed' });
}));

export default router;
