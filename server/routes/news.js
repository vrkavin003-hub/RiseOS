import { Router } from 'express';
import News from '../models/News.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { refreshNews } from '../services/newsService.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  res.json({ items: await News.find({}).sort({ publishedAt: -1, createdAt: -1 }).limit(100) });
}));

router.post('/refresh', requireAuth, asyncHandler(async (req, res) => {
  res.json({ items: await refreshNews() });
}));

router.post('/:id/save', requireAuth, asyncHandler(async (req, res) => {
  const item = await News.findByIdAndUpdate(req.params.id, { $addToSet: { savedBy: req.user._id } }, { new: true });
  if (!item) return res.status(404).json({ message: 'News item not found' });
  res.json({ item });
}));

export default router;
