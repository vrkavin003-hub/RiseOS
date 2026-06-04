import { Router } from 'express';
import { body } from 'express-validator';
import Habit from '../models/Habit.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateDashboard } from '../services/dashboardService.js';
import { upsertNotification } from '../services/notificationService.js';
import { emitToUser } from '../services/realtime.js';
import { cleanObject, cleanString } from '../utils/sanitize.js';

const router = Router();

const categories = ['career', 'discipline', 'finance', 'health', 'learning', 'productivity', 'other'];
const frequencies = ['daily', 'weekly', 'monthly'];

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfIsoWeek(date) {
  const day = startOfUtcDay(date);
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() - weekday + 1);
  return day;
}

function periodStart(date, frequency) {
  if (frequency === 'weekly') return startOfIsoWeek(date);
  if (frequency === 'monthly') return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return startOfUtcDay(date);
}

function nextPeriod(date, frequency, amount = 1) {
  const next = new Date(date);

  if (frequency === 'monthly') {
    next.setUTCMonth(next.getUTCMonth() + amount);
    return next;
  }

  next.setUTCDate(next.getUTCDate() + (frequency === 'weekly' ? 7 : 1) * amount);
  return next;
}

function periodKey(date, frequency) {
  const start = periodStart(date, frequency);
  return start.toISOString().slice(0, frequency === 'monthly' ? 7 : 10);
}

function completedPeriods(habit) {
  const counts = new Map();
  habit.completions.forEach((completion) => {
    const key = periodKey(new Date(completion.completedAt), habit.frequency);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return counts;
}

function recalculateStreaks(habit) {
  const target = Math.max(1, Number(habit.targetPerPeriod || 1));
  const periodCounts = completedPeriods(habit);
  const completeKeys = new Set([...periodCounts.entries()].filter(([, count]) => count >= target).map(([key]) => key));
  const sortedKeys = [...completeKeys].sort();

  let longestStreak = 0;
  let runningStreak = 0;
  let previousStart = null;

  sortedKeys.forEach((key) => {
    const currentStart = periodStart(new Date(`${key}${habit.frequency === 'monthly' ? '-01' : ''}T00:00:00.000Z`), habit.frequency);
    const expectedStart = previousStart ? nextPeriod(previousStart, habit.frequency) : null;
    runningStreak = expectedStart && currentStart.getTime() === expectedStart.getTime() ? runningStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, runningStreak);
    previousStart = currentStart;
  });

  const currentStart = periodStart(new Date(), habit.frequency);
  const currentKey = periodKey(currentStart, habit.frequency);
  const previousKey = periodKey(nextPeriod(currentStart, habit.frequency, -1), habit.frequency);
  let currentStreak = 0;
  let cursor = completeKeys.has(currentKey) ? currentStart : completeKeys.has(previousKey) ? nextPeriod(currentStart, habit.frequency, -1) : null;

  while (cursor && completeKeys.has(periodKey(cursor, habit.frequency))) {
    currentStreak += 1;
    cursor = nextPeriod(cursor, habit.frequency, -1);
  }

  habit.currentStreak = currentStreak;
  habit.longestStreak = longestStreak;
}

function buildHabitAnalytics(habits) {
  const now = new Date();
  const currentDailyStart = periodStart(now, 'daily');
  const currentWeeklyStart = periodStart(now, 'weekly');
  const currentMonthlyStart = periodStart(now, 'monthly');
  const weeklyStarts = Array.from({ length: 7 }, (_, index) => nextPeriod(currentDailyStart, 'daily', index - 6));
  const monthlyStarts = Array.from({ length: 30 }, (_, index) => nextPeriod(currentDailyStart, 'daily', index - 29));

  const activeHabits = habits.filter((habit) => !habit.isArchived);
  const periodDone = (habit, date) => {
    const target = Math.max(1, Number(habit.targetPerPeriod || 1));
    const key = periodKey(date, habit.frequency);
    return (completedPeriods(habit).get(key) || 0) >= target;
  };

  const currentPeriodDone = activeHabits.filter((habit) => periodDone(habit, now)).length;
  const totalCompletions = habits.reduce((total, habit) => total + habit.completions.length, 0);
  const bestStreak = habits.reduce((max, habit) => Math.max(max, habit.longestStreak || 0), 0);

  const weekly = weeklyStarts.map((day) => {
    const completed = activeHabits.filter((habit) => periodDone(habit, day)).length;
    return {
      completed,
      day: day.toISOString().slice(5, 10),
      rate: activeHabits.length ? Math.round((completed / activeHabits.length) * 100) : 0,
    };
  });

  const monthlyCompletedDays = monthlyStarts.filter((day) => activeHabits.some((habit) => periodDone(habit, day))).length;

  return {
    activeHabits: activeHabits.length,
    bestStreak,
    completionRate: activeHabits.length ? Math.round((currentPeriodDone / activeHabits.length) * 100) : 0,
    currentPeriodDone,
    monthly: {
      completedDays: monthlyCompletedDays,
      rate: Math.round((monthlyCompletedDays / monthlyStarts.length) * 100),
      totalDays: monthlyStarts.length,
    },
    periodStarts: {
      day: currentDailyStart,
      month: currentMonthlyStart,
      week: currentWeeklyStart,
    },
    totalCompletions,
    weekly,
  };
}

async function emitDashboard(userId) {
  emitToUser(userId, 'dashboard:update', await calculateDashboard(userId));
}

const optionalHabitValidators = [
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Description is too long'),
  body('category').optional().isIn(categories).withMessage('Invalid habit category'),
  body('frequency').optional().isIn(frequencies).withMessage('Invalid habit frequency'),
  body('targetPerPeriod').optional().isInt({ max: 20, min: 1 }).withMessage('Target must be between 1 and 20'),
  body('isArchived').optional().isBoolean().withMessage('Archive state must be true or false'),
];

const habitValidators = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Habit name must be 2-100 characters'),
  ...optionalHabitValidators,
];

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await Habit.find({ user: req.user._id }).sort({ isArchived: 1, createdAt: -1 });
    res.json({ analytics: buildHabitAnalytics(items), items });
  }),
);

router.get(
  '/analytics',
  requireAuth,
  asyncHandler(async (req, res) => {
    const habits = await Habit.find({ user: req.user._id });
    res.json({ analytics: buildHabitAnalytics(habits) });
  }),
);

router.post(
  '/',
  requireAuth,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Habit name must be 2-100 characters'),
    ...optionalHabitValidators,
  ],
  validate,
  asyncHandler(async (req, res) => {
    const item = await Habit.create({
      ...cleanObject(req.body),
      targetPerPeriod: Number(req.body.targetPerPeriod || 1),
      user: req.user._id,
    });
    await emitDashboard(req.user._id);
    res.status(201).json({ item });
  }),
);

router.post(
  '/:id/complete',
  requireAuth,
  [
    body('completedAt').optional().isISO8601().withMessage('Completion date must be valid'),
    body('note').optional({ checkFalsy: true }).trim().isLength({ max: 240 }).withMessage('Completion note is too long'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const completedAt = req.body.completedAt ? new Date(req.body.completedAt) : new Date();
    const key = periodKey(completedAt, habit.frequency);
    const target = Math.max(1, Number(habit.targetPerPeriod || 1));
    const completedThisPeriod = habit.completions.filter((completion) => periodKey(new Date(completion.completedAt), habit.frequency) === key).length;

    if (completedThisPeriod >= target) {
      return res.status(409).json({ message: `Habit already completed for this ${habit.frequency} period` });
    }

    habit.completions.push({ completedAt, note: cleanString(req.body.note || '') });
    recalculateStreaks(habit);
    await habit.save();
    if (req.user.notificationSettings?.habits !== false) {
      await upsertNotification({
        body: `${habit.name} logged for this ${habit.frequency} period. Current streak: ${habit.currentStreak}.`,
        metadata: { habitId: habit._id },
        metadataKey: `habit:${habit._id}:complete:${key}`,
        title: 'Habit completed',
        type: 'habit',
        user: req.user._id,
      });
    }
    await emitDashboard(req.user._id);
    res.json({ item: habit });
  }),
);

router.delete(
  '/:id/completions/:completionId',
  requireAuth,
  asyncHandler(async (req, res) => {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const before = habit.completions.length;
    habit.completions = habit.completions.filter((completion) => String(completion._id) !== req.params.completionId);
    if (habit.completions.length === before) return res.status(404).json({ message: 'Completion not found' });

    recalculateStreaks(habit);
    await habit.save();
    await emitDashboard(req.user._id);
    res.json({ item: habit });
  }),
);

router.patch(
  '/:id',
  requireAuth,
  habitValidators,
  validate,
  asyncHandler(async (req, res) => {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    Object.assign(habit, cleanObject(req.body));
    if (req.body.targetPerPeriod) habit.targetPerPeriod = Number(req.body.targetPerPeriod);
    recalculateStreaks(habit);
    await habit.save();
    await emitDashboard(req.user._id);
    res.json({ item: habit });
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Habit not found' });
    await emitDashboard(req.user._id);
    res.json({ message: 'Deleted' });
  }),
);

export default router;
