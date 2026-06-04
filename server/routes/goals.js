import Goal from '../models/Goal.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateDashboard } from '../services/dashboardService.js';
import { upsertNotification } from '../services/notificationService.js';
import { emitToUser } from '../services/realtime.js';
import { cleanObject } from '../utils/sanitize.js';

import { Router } from 'express';

const router = Router();

async function emitDashboardUpdate(userId) {
  emitToUser(userId, 'dashboard:update', await calculateDashboard(userId));
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ items: await Goal.find({ user: req.user._id }).sort({ createdAt: -1 }) });
  }),
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Goal.create({ ...cleanObject(req.body), user: req.user._id });
    await emitDashboardUpdate(req.user._id);
    res.status(201).json({ item });
  }),
);

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Goal.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, cleanObject(req.body), { new: true });
    if (!item) return res.status(404).json({ message: 'Goal not found' });
    if ((req.body.status === 'completed' || req.body.progress >= 100) && req.user.notificationSettings?.goals !== false) {
      await upsertNotification({
        body: `${item.title} is now marked complete.`,
        metadata: { goalId: item._id },
        metadataKey: `goal:${item._id}:completed`,
        title: 'Goal completed',
        type: 'goal',
        user: req.user._id,
      });
    }
    await emitDashboardUpdate(req.user._id);
    res.json({ item });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Goal not found' });
    await emitDashboardUpdate(req.user._id);
    res.json({ message: 'Deleted' });
  }),
);

export default router;
