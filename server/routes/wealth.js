import { Router } from 'express';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { calculateDashboard } from '../services/dashboardService.js';
import { emitToUser } from '../services/realtime.js';
import { cleanObject } from '../utils/sanitize.js';

const router = Router();

async function emitDashboardUpdate(userId) {
  emitToUser(userId, 'dashboard:update', await calculateDashboard(userId));
}

router.get('/summary', requireAuth, asyncHandler(async (req, res) => {
  const [expenses, incomes] = await Promise.all([Expense.find({ user: req.user._id }), Income.find({ user: req.user._id })]);
  res.json({
    expenses,
    incomes,
    summary: {
      totalExpenses: expenses.reduce((total, item) => total + item.amount, 0),
      totalIncome: incomes.reduce((total, item) => total + item.amount, 0),
    },
  });
}));

router.post(
  '/expenses',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Expense.create({ ...cleanObject(req.body), user: req.user._id });
    await emitDashboardUpdate(req.user._id);
    res.status(201).json({ item });
  }),
);

router.post(
  '/income',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Income.create({ ...cleanObject(req.body), user: req.user._id });
    await emitDashboardUpdate(req.user._id);
    res.status(201).json({ item });
  }),
);

router.delete(
  '/expenses/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Expense not found' });
    await emitDashboardUpdate(req.user._id);
    res.json({ message: 'Deleted' });
  }),
);

router.delete(
  '/income/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Income not found' });
    await emitDashboardUpdate(req.user._id);
    res.json({ message: 'Deleted' });
  }),
);

export default router;
