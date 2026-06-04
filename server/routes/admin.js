import mongoose from 'mongoose';
import { Router } from 'express';
import { body, query } from 'express-validator';
import AIChat from '../models/AIChat.js';
import BusinessIdea from '../models/BusinessIdea.js';
import Expense from '../models/Expense.js';
import Friend from '../models/Friend.js';
import Goal from '../models/Goal.js';
import Habit from '../models/Habit.js';
import Income from '../models/Income.js';
import Journal from '../models/Journal.js';
import News from '../models/News.js';
import Notification from '../models/Notification.js';
import Skill from '../models/Skill.js';
import Status from '../models/Status.js';
import User from '../models/User.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.use(requireAuth, requireAdmin);

function startOfDay(daysAgo = 0) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date;
}

function getDbState() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

async function sumAmount(Model, field = 'amount') {
  const [result] = await Model.aggregate([{ $group: { _id: null, total: { $sum: `$${field}` } } }]);
  return result?.total || 0;
}

async function buildOverview() {
  const sevenDaysAgo = startOfDay(7);
  const thirtyDaysAgo = startOfDay(30);

  const [
    users,
    verifiedUsers,
    admins,
    newUsers7d,
    activeUsers30d,
    journals,
    journal7d,
    goals,
    completedGoals,
    habits,
    skills,
    aiChats,
    businessIdeas,
    notifications,
    unreadNotifications,
    activeStatuses,
    friendConnections,
    newsItems,
    totalIncome,
    totalExpenses,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ emailVerified: true }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } }),
    Journal.countDocuments(),
    Journal.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Goal.countDocuments(),
    Goal.countDocuments({ $or: [{ status: 'completed' }, { progress: { $gte: 100 } }] }),
    Habit.countDocuments(),
    Skill.countDocuments(),
    AIChat.countDocuments(),
    BusinessIdea.countDocuments(),
    Notification.countDocuments(),
    Notification.countDocuments({ read: false }),
    Status.countDocuments({ expiresAt: { $gt: new Date() } }),
    Friend.countDocuments(),
    News.countDocuments(),
    sumAmount(Income),
    sumAmount(Expense),
  ]);

  return {
    activity: {
      aiChats,
      businessIdeas,
      habits,
      journal7d,
      journals,
      skills,
    },
    finance: {
      netTracked: totalIncome - totalExpenses,
      totalExpenses,
      totalIncome,
    },
    growth: {
      completedGoals,
      goalCompletionRate: goals ? Math.round((completedGoals / goals) * 100) : 0,
      goals,
      journal7d,
    },
    notifications: {
      notifications,
      unreadNotifications,
    },
    social: {
      activeStatuses,
      friendConnections,
    },
    users: {
      activeUsers30d,
      admins,
      newUsers7d,
      users,
      verificationRate: users ? Math.round((verifiedUsers / users) * 100) : 0,
      verifiedUsers,
    },
    world: {
      newsItems,
    },
  };
}

router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    res.json({ summary: await buildOverview() });
  }),
);

router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    res.json({ overview: await buildOverview() });
  }),
);

router.get(
  '/users',
  [
    query('q').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Search is too long'),
    query('role').optional({ checkFalsy: true }).isIn(['admin', 'user']).withMessage('Invalid role'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive'),
    query('limit').optional().isInt({ max: 50, min: 1 }).withMessage('Limit must be 1-50'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }, { profession: new RegExp(q, 'i') }];
    }

    const [items, total] = await Promise.all([
      User.find(filter).select('name email role profession location emailVerified lastLoginAt createdAt').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        limit,
        page,
        pages: Math.ceil(total / limit) || 1,
        total,
      },
    });
  }),
);

router.patch(
  '/users/:id',
  [body('role').optional().isIn(['admin', 'user']).withMessage('Invalid role')],
  validate,
  asyncHandler(async (req, res) => {
    if (String(req.params.id) === String(req.user._id) && req.body.role === 'user') {
      return res.status(400).json({ message: 'You cannot remove your own admin access' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true }).select(
      'name email role profession location emailVerified lastLoginAt createdAt',
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  }),
);

router.get(
  '/reports',
  asyncHandler(async (req, res) => {
    const [recentJournals, recentGoals, recentAIChats, recentBusinessIdeas] = await Promise.all([
      Journal.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(8),
      Goal.find({}).populate('user', 'name email').sort({ updatedAt: -1 }).limit(8),
      AIChat.find({}).populate('user', 'name email').sort({ updatedAt: -1 }).limit(8),
      BusinessIdea.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(8),
    ]);

    res.json({
      reports: {
        aiChats: recentAIChats,
        businessIdeas: recentBusinessIdeas,
        goals: recentGoals,
        journals: recentJournals,
      },
    });
  }),
);

router.get(
  '/content',
  asyncHandler(async (req, res) => {
    const [news, statuses, notifications] = await Promise.all([
      News.find({}).sort({ publishedAt: -1, createdAt: -1 }).limit(20),
      Status.find({ expiresAt: { $gt: new Date() } }).populate('user', 'name email').sort({ createdAt: -1 }).limit(20),
      Notification.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(20),
    ]);

    res.json({ content: { news, notifications, statuses } });
  }),
);

router.delete(
  '/content/news/:id',
  asyncHandler(async (req, res) => {
    const item = await News.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'News item not found' });
    res.json({ message: 'News item removed' });
  }),
);

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.json({
      health: {
        database: getDbState(),
        environment: {
          emailConfigured: Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS),
          hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
          hasMongoUri: Boolean(process.env.MONGO_URI),
          hasNewsKey: Boolean(process.env.NEWS_API_KEY),
          hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY),
          nodeEnv: process.env.NODE_ENV || 'development',
        },
        memory: process.memoryUsage(),
        serverTime: new Date(),
        uptimeSeconds: Math.round(process.uptime()),
      },
    });
  }),
);

export default router;
