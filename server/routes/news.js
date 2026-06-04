import { Router } from 'express';
import News from '../models/News.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { createNotification } from '../services/notificationService.js';
import { refreshNews } from '../services/newsService.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  res.json({ items: await News.find({}).sort({ publishedAt: -1, createdAt: -1 }).limit(100) });
}));

router.post('/refresh', requireAuth, asyncHandler(async (req, res) => {
  const items = await refreshNews();
  if (req.user.notificationSettings?.news !== false) {
    await createNotification({
      body: items.length ? `${items.length} intelligence briefings are available.` : 'News refresh completed. Add NEWS_API_KEY for live articles.',
      title: 'News refresh complete',
      type: 'news',
      user: req.user._id,
    });
  }
  res.json({ items });
}));

router.post('/:id/save', requireAuth, asyncHandler(async (req, res) => {
  const item = await News.findByIdAndUpdate(req.params.id, { $addToSet: { savedBy: req.user._id } }, { new: true });
  if (!item) return res.status(404).json({ message: 'News item not found' });
  res.json({ item });
}));

export default router;
