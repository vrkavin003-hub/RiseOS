import { Router } from 'express';
import User from '../models/User.js';
import Journal from '../models/Journal.js';
import Goal from '../models/Goal.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/summary', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const [users, journals, goals] = await Promise.all([User.countDocuments(), Journal.countDocuments(), Goal.countDocuments()]);
  res.json({ summary: { goals, journals, users } });
}));

export default router;
