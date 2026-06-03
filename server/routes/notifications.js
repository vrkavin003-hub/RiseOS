import { Router } from 'express';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => res.json({ items: await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }) })));

router.patch('/read-all', requireAuth, asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true });
  res.json({ message: 'Notifications marked as read' });
}));

export default router;
