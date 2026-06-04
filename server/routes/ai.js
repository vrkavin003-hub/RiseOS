import { Router } from 'express';
import AIChat from '../models/AIChat.js';
import Goal from '../models/Goal.js';
import Habit from '../models/Habit.js';
import Journal from '../models/Journal.js';
import Skill from '../models/Skill.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateAIResponse } from '../services/aiService.js';
import { createNotification } from '../services/notificationService.js';
import { cleanString } from '../utils/sanitize.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => res.json({ items: await AIChat.find({ user: req.user._id }).sort({ updatedAt: -1 }) })));

router.post(
  '/chat',
  requireAuth,
  asyncHandler(async (req, res) => {
    const message = cleanString(req.body.message);
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const [journals, habits, goals, skills, existingChat] = await Promise.all([
      Journal.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
      Habit.find({ user: req.user._id }),
      Goal.find({ user: req.user._id }),
      Skill.find({ user: req.user._id }),
      req.body.chatId ? AIChat.findOne({ _id: req.body.chatId, user: req.user._id }) : null,
    ]);

    const userMessage = { content: message, role: 'user' };
    const priorMessages = existingChat?.messages?.slice(-10) || [];
    const reply = await generateAIResponse({
      messages: [...priorMessages, userMessage],
      userContext: { goals, habits, journals, profile: req.user, skills },
    });
    const assistantMessage = { content: reply, role: 'assistant' };

    const chat =
      existingChat ||
      new AIChat({
        messages: [],
        title: cleanString(req.body.title) || message.slice(0, 72),
        user: req.user._id,
      });

    chat.messages.push(userMessage, assistantMessage);
    await chat.save();

    if (req.user.notificationSettings?.aiAdvice !== false) {
      await createNotification({
        body: 'Your AI Coach response is ready in the coaching thread.',
        metadata: { chatId: chat._id },
        title: 'AI response ready',
        type: 'ai',
        user: req.user._id,
      });
    }

    res.status(201).json({ chat, reply });
  }),
);

export default router;
