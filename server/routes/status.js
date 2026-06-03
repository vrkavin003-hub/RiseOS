import { Router } from 'express';
import Status from '../models/Status.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { emitToUser } from '../services/realtime.js';
import { cleanObject } from '../utils/sanitize.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const items = await Status.find({ expiresAt: { $gt: new Date() } }).populate('user', 'name profilePhoto privacySettings');
  res.json({ items });
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const item = await Status.create({
    ...cleanObject(req.body),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    user: req.user._id,
  });
  emitToUser(req.user._id, 'status:update', item);
  res.status(201).json({ item });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Status.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) return res.status(404).json({ message: 'Status not found' });
  res.json({ message: 'Deleted' });
}));

export default router;
