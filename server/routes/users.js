import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sendMail } from '../services/mailer.js';
import asyncHandler from '../utils/asyncHandler.js';
import { cleanObject } from '../utils/sanitize.js';
import { hashToken, randomToken } from '../utils/tokens.js';

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

router.patch(
  '/me',
  requireAuth,
  [
    body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
    body('bio').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('Bio is too long'),
    body('profession').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Profession is too long'),
    body('location').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Location is too long'),
    body('goals').optional().isArray({ max: 10 }).withMessage('Goals must be a list of up to 10 items'),
    body('goals.*').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Each goal must be 120 characters or less'),
    body('aiPreferences.coachingStyle').optional().isIn(['direct', 'supportive', 'strategic', 'analytical']).withMessage('Invalid coaching style'),
    body('aiPreferences.focusAreas').optional().isArray({ max: 12 }).withMessage('Focus areas must be a list of up to 12 items'),
    body('aiPreferences.focusAreas.*').optional({ checkFalsy: true }).trim().isLength({ max: 80 }).withMessage('Each focus area must be 80 characters or less'),
    body('privacySettings.profileVisibility').optional().isIn(['public', 'friends', 'private']).withMessage('Invalid profile visibility'),
    body('privacySettings.statusVisibility').optional().isIn(['public', 'friends', 'private']).withMessage('Invalid status visibility'),
    body('themePreference').optional().isIn(['dark', 'system']).withMessage('Invalid theme preference'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const allowed = ['name', 'bio', 'profession', 'location', 'goals', 'aiPreferences', 'privacySettings', 'notificationSettings', 'themePreference'];
    const updates = cleanObject(Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))));
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password -refreshTokens');
    res.json({ user });
  }),
);

router.patch(
  '/me/email',
  requireAuth,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required'), body('password').notEmpty().withMessage('Current password required')],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const existing = await User.findOne({ email: req.body.email, _id: { $ne: user._id } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    if (user.email !== req.body.email) {
      const emailVerificationToken = randomToken();
      user.email = req.body.email;
      user.emailVerified = false;
      user.emailVerificationToken = hashToken(emailVerificationToken);
      await user.save();

      await sendMail({
        html: `<p>Verify your updated RiseOS AI email:</p><p><a href="${env.clientUrl}/verify-email?token=${emailVerificationToken}">Verify email</a></p>`,
        subject: 'Verify your updated RiseOS AI email',
        to: user.email,
      });
    }

    res.json({ message: 'Email updated. Please verify the new address.', user: user.toSafeJSON() });
  }),
);

router.patch(
  '/me/password',
  requireAuth,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(req.body.currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = req.body.password;
    user.refreshTokens = [];
    await user.save();

    res.clearCookie('riseos_refresh');
    res.json({ message: 'Password updated. Please sign in again on other devices.', user: user.toSafeJSON() });
  }),
);

router.post('/me/photo', requireAuth, upload.single('photo'), asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Photo required' });
  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const user = await User.findByIdAndUpdate(req.user._id, { profilePhoto: dataUrl }, { new: true }).select('-password -refreshTokens');
  res.json({ user });
}));

export default router;
