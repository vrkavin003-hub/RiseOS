import { Router } from 'express';
import Journal from '../models/Journal.js';
import Notification from '../models/Notification.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { analyzeJournal } from '../services/aiService.js';
import { calculateDashboard } from '../services/dashboardService.js';
import { emitToUser } from '../services/realtime.js';
import { cleanObject } from '../utils/sanitize.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ items: await Journal.find({ user: req.user._id }).sort({ createdAt: -1 }) });
  }),
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const entry = await Journal.create({ ...cleanObject(req.body), user: req.user._id });
    entry.aiAnalysis = await analyzeJournal(entry);
    await entry.save();

    await Notification.create({
      body: 'Your journal analysis is ready.',
      title: 'Journal analyzed',
      type: 'journal',
      user: req.user._id,
    });

    emitToUser(req.user._id, 'dashboard:update', await calculateDashboard(req.user._id));
    emitToUser(req.user._id, 'notification:new', { title: 'Journal analyzed' });
    res.status(201).json({ item: entry });
  }),
);

export default router;
