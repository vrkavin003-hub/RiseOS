import { Router } from 'express';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateAutomatedNotifications } from '../services/notificationService.js';

const router = Router();

async function listNotifications(userId) {
  const [items, unreadCount] = await Promise.all([
    Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(80),
    Notification.countDocuments({ read: false, user: userId }),
  ]);

  return { items, unreadCount };
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    await generateAutomatedNotifications(req.user);
    res.json(await listNotifications(req.user._id));
  }),
);

router.post(
  '/refresh',
  requireAuth,
  asyncHandler(async (req, res) => {
    await generateAutomatedNotifications(req.user);
    res.json(await listNotifications(req.user._id));
  }),
);

router.patch(
  '/read-all',
  requireAuth,
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user._id }, { read: true });
    res.json(await listNotifications(req.user._id));
  }),
);

router.patch(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { read: true }, { new: true });
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    res.json({ item, unreadCount: await Notification.countDocuments({ read: false, user: req.user._id }) });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Notification not found' });
    res.json(await listNotifications(req.user._id));
  }),
);

export default router;
