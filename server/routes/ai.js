import { Router } from 'express';
import AIChat from '../models/AIChat.js';
import Goal from '../models/Goal.js';
import Habit from '../models/Habit.js';
import Journal from '../models/Journal.js';
import Skill from '../models/Skill.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateAIResponse } from '../services/aiService.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => res.json({ items: await AIChat.find({ user: req.user._id }).sort({ updatedAt: -1 }) })));

router.post('/chat', requireAuth, asyncHandler(async (req, res) => {
  const [journals, habits, goals, skills] = await Promise.all([
    Journal.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
    Habit.find({ user: req.user._id }),
    Goal.find({ user: req.user._id }),
    Skill.find({ user: req.user._id }),
  ]);

  const userMessage = { content: req.body.message, role: 'user' };
  const reply = await generateAIResponse({
    messages: [userMessage],
    userContext: { goals, habits, journals, profile: req.user, skills },
  });

  const chat = await AIChat.create({
    messages: [userMessage, { content: reply, role: 'assistant' }],
    title: req.body.title || 'RiseOS coaching session',
    user: req.user._id,
  });

  res.status(201).json({ chat, reply });
}));

export default router;
