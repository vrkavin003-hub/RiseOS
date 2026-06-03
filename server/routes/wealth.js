import { Router } from 'express';
import Expense from '../models/Expense.js';
import Income from '../models/Income.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanObject } from '../utils/sanitize.js';

const router = Router();

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

router.post('/expenses', requireAuth, asyncHandler(async (req, res) => res.status(201).json({ item: await Expense.create({ ...cleanObject(req.body), user: req.user._id }) })));
router.post('/income', requireAuth, asyncHandler(async (req, res) => res.status(201).json({ item: await Income.create({ ...cleanObject(req.body), user: req.user._id }) })));

export default router;
