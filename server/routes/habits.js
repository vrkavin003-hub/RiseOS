import { Router } from 'express';
import Habit from '../models/Habit.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateDashboard } from '../services/dashboardService.js';
import { emitToUser } from '../services/realtime.js';
import { cleanObject } from '../utils/sanitize.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => res.json({ items: await Habit.find({ user: req.user._id }).sort({ createdAt: -1 }) })));

router.post('/', requireAuth, asyncHandler(async (req, res) => res.status(201).json({ item: await Habit.create({ ...cleanObject(req.body), user: req.user._id }) })));

router.post(
  '/:id/complete',
  requireAuth,
  asyncHandler(async (req, res) => {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    habit.completions.push({ note: req.body.note || '' });
    habit.currentStreak += 1;
    habit.longestStreak = Math.max(habit.longestStreak, habit.currentStreak);
    await habit.save();
    emitToUser(req.user._id, 'dashboard:update', await calculateDashboard(req.user._id));
    res.json({ item: habit });
  }),
);

router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Habit.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, cleanObject(req.body), { new: true });
  if (!item) return res.status(404).json({ message: 'Habit not found' });
  res.json({ item });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) return res.status(404).json({ message: 'Habit not found' });
  res.json({ message: 'Deleted' });
}));

export default router;
