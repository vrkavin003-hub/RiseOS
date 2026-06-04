import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: '15m' });
}

export function signRefreshToken(user, rememberMe = false) {
  return jwt.sign({ id: user._id.toString(), rememberMe: Boolean(rememberMe), role: user.role }, env.jwtRefreshSecret, { expiresIn: rememberMe ? '30d' : '7d' });
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}
