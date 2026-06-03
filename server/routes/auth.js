import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { body } from 'express-validator';
import User from '../models/User.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import asyncHandler from '../utils/asyncHandler.js';
import { hashToken, randomToken, signAccessToken, signRefreshToken } from '../utils/tokens.js';
import { sendMail } from '../services/mailer.js';

const router = Router();

function refreshCookieOptions(rememberMe = false) {
  return {
    httpOnly: true,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    secure: env.nodeEnv === 'production',
  };
}

async function issueSession(res, user, rememberMe = false) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, rememberMe);
  user.refreshTokens.push({
    expiresAt: new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000),
    tokenHash: hashToken(refreshToken),
  });
  user.lastLoginAt = new Date();
  await user.save();
  res.cookie('riseos_refresh', refreshToken, refreshCookieOptions(rememberMe));
  return { accessToken, user: user.toSafeJSON() };
}

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('primaryAmbition').optional({ checkFalsy: true }).trim().isLength({ max: 120 }).withMessage('Primary ambition is too long'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const existing = await User.findOne({ email: req.body.email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const emailVerificationToken = randomToken();
    const user = await User.create({
      email: req.body.email,
      emailVerificationToken: hashToken(emailVerificationToken),
      goals: req.body.primaryAmbition ? [req.body.primaryAmbition] : [],
      name: req.body.name,
      password: req.body.password,
    });

    await sendMail({
      html: `<p>Verify your RiseOS AI account:</p><p><a href="${env.clientUrl}/verify-email?token=${emailVerificationToken}">Verify email</a></p>`,
      subject: 'Verify your RiseOS AI email',
      to: user.email,
    });

    res.status(201).json(await issueSession(res, user, req.body.rememberMe));
  }),
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email }).select('+password');
    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json(await issueSession(res, user, req.body.rememberMe));
  }),
);

router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.riseos_refresh || req.body.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
    const tokenHash = hashToken(refreshToken);
    const user = await User.findById(payload.id).select('+password');
    const storedToken = user?.refreshTokens.find((token) => token.tokenHash === tokenHash && token.expiresAt > new Date());

    if (!user || !storedToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    user.refreshTokens = user.refreshTokens.filter((token) => token.tokenHash !== tokenHash);
    res.json(await issueSession(res, user, true));
  }),
);

router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail()],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      const resetToken = randomToken();
      user.passwordResetToken = hashToken(resetToken);
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      await sendMail({
        html: `<p>Reset your RiseOS AI password:</p><p><a href="${env.clientUrl}/reset-password?token=${resetToken}">Reset password</a></p>`,
        subject: 'Reset your RiseOS AI password',
        to: user.email,
      });
    }
    res.json({ message: 'If that email exists, reset instructions were sent' });
  }),
);

router.post(
  '/reset-password',
  [body('token').notEmpty(), body('password').isLength({ min: 8 })],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({
      passwordResetExpires: { $gt: new Date() },
      passwordResetToken: hashToken(req.body.token),
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired reset token' });

    user.password = req.body.password;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    user.refreshTokens = [];
    await user.save();
    res.json({ message: 'Password updated' });
  }),
);

router.post(
  '/verify-email',
  [body('token').notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const user = await User.findOne({ emailVerificationToken: hashToken(req.body.token) });
    if (!user) return res.status(400).json({ message: 'Invalid verification token' });
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    res.json({ message: 'Email verified' });
  }),
);

router.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.riseos_refresh;
    if (refreshToken) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { refreshTokens: { tokenHash: hashToken(refreshToken) } } });
    }
    res.clearCookie('riseos_refresh');
    res.json({ message: 'Logged out' });
  }),
);

router.post(
  '/logout-everywhere',
  requireAuth,
  asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshTokens: [] });
    res.clearCookie('riseos_refresh');
    res.json({ message: 'Logged out everywhere' });
  }),
);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
