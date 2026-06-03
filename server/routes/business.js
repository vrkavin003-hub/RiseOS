import { Router } from 'express';
import BusinessIdea from '../models/BusinessIdea.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { generateAIResponse } from '../services/aiService.js';
import { cleanObject } from '../utils/sanitize.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => res.json({ items: await BusinessIdea.find({ user: req.user._id }).sort({ createdAt: -1 }) })));

router.post('/generate', requireAuth, asyncHandler(async (req, res) => {
  const ideaText = req.body.idea;
  const analysis = await generateAIResponse({
    messages: [{ content: `Create a business plan, SWOT, target customers, revenue model, and 30-day action plan for: ${ideaText}`, role: 'user' }],
    userContext: { profile: req.user },
  });

  const idea = await BusinessIdea.create({
    ...cleanObject(req.body),
    businessPlan: analysis,
    firstThirtyDayPlan: analysis,
    revenueModel: analysis,
    swot: analysis,
    targetCustomers: analysis,
    user: req.user._id,
  });

  res.status(201).json({ item: idea });
}));

router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await BusinessIdea.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, cleanObject(req.body), { new: true });
  if (!item) return res.status(404).json({ message: 'Business idea not found' });
  res.json({ item });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await BusinessIdea.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!item) return res.status(404).json({ message: 'Business idea not found' });
  res.json({ message: 'Deleted' });
}));

export default router;
