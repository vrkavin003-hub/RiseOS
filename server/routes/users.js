import { Router } from 'express';
import multer from 'multer';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanObject } from '../utils/sanitize.js';

const router = Router();
const upload = multer({ limits: { fileSize: 2 * 1024 * 1024 }, storage: multer.memoryStorage() });

router.get('/search', requireAuth, asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.json({ items: [] });
  const items = await User.find({
    _id: { $ne: req.user._id },
    $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }],
  }).select('name email profession location profilePhoto privacySettings');
  res.json({ items });
}));

router.get('/me', requireAuth, (req, res) => res.json({ user: req.user }));

router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const allowed = ['name', 'bio', 'profession', 'location', 'goals', 'aiPreferences', 'privacySettings', 'notificationSettings', 'themePreference'];
  const updates = cleanObject(Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))));
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password -refreshTokens');
  res.json({ user });
}));

router.post('/me/photo', requireAuth, upload.single('photo'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Photo required' });
  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const user = await User.findByIdAndUpdate(req.user._id, { profilePhoto: dataUrl }, { new: true }).select('-password -refreshTokens');
  res.json({ user });
}));

export default router;
