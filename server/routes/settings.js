import { Router } from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.patch('/', requireAuth, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      aiPreferences: req.body.aiPreferences,
      notificationSettings: req.body.notificationSettings,
      privacySettings: req.body.privacySettings,
      themePreference: req.body.themePreference,
    },
    { new: true },
  ).select('-password -refreshTokens');
  res.json({ user });
}));

router.delete('/account', requireAuth, asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id);
  res.json({ message: 'Account deleted' });
}));

export default router;
