import { Router } from 'express';
import Skill from '../models/Skill.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateDashboard } from '../services/dashboardService.js';
import { emitToUser } from '../services/realtime.js';
import { cleanObject } from '../utils/sanitize.js';

const router = Router();

async function emitDashboardUpdate(userId) {
  emitToUser(userId, 'dashboard:update', await calculateDashboard(userId));
}

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ items: await Skill.find({ user: req.user._id }).sort({ createdAt: -1 }) });
  }),
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Skill.create({ ...cleanObject(req.body), user: req.user._id });
    await emitDashboardUpdate(req.user._id);
    res.status(201).json({ item });
  }),
);

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Skill.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, cleanObject(req.body), { new: true });
    if (!item) return res.status(404).json({ message: 'Skill not found' });
    await emitDashboardUpdate(req.user._id);
    res.json({ item });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Skill.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Skill not found' });
    await emitDashboardUpdate(req.user._id);
    res.json({ message: 'Deleted' });
  }),
);

export default router;
