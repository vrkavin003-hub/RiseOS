import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { sanitizeRequest } from './middleware/security.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';
import businessRoutes from './routes/business.js';
import dashboardRoutes from './routes/dashboard.js';
import friendsRoutes from './routes/friends.js';
import goalsRoutes from './routes/goals.js';
import habitsRoutes from './routes/habits.js';
import journalRoutes from './routes/journal.js';
import newsRoutes from './routes/news.js';
import notificationsRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import skillsRoutes from './routes/skills.js';
import statusRoutes from './routes/status.js';
import usersRoutes from './routes/users.js';
import wealthRoutes from './routes/wealth.js';

const app = express();
const dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDistPath = path.resolve(dirname, '..', 'dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');
const hasClientBuild = fs.existsSync(clientIndexPath);

app.disable('x-powered-by');
app.set('trust proxy', env.isProduction ? 1 : false);

if (env.isProduction && !hasClientBuild) {
  console.warn('Production client build was not found. Run npm run build before starting the server.');
}

const corsOrigin = (origin, callback) => {
  if (!origin || env.clientUrls.includes(origin)) {
    callback(null, true);
    return;
  }

  const error = new Error('Not allowed by CORS');
  error.status = 403;
  callback(error);
};

const globalApiLimiter = rateLimit({
  limit: 450,
  message: { message: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

const authLimiter = rateLimit({
  limit: 45,
  message: { message: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  windowMs: 15 * 60 * 1000,
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: env.isProduction,
  }),
);
app.use(
  cors({
    credentials: true,
    origin: corsOrigin,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(sanitizeRequest);

app.use(
  '/api/ai',
  rateLimit({
    limit: 30,
    message: { message: 'Too many AI requests. Please slow down.' },
    standardHeaders: true,
    windowMs: 15 * 60 * 1000,
  }),
);

app.get('/api/health', (req, res) => {
  res.json({
    configuration: {
      issues: env.productionConfigIssues,
      ok: env.productionConfigIssues.length === 0,
    },
    name: 'RiseOS AI API',
    ok: env.productionConfigIssues.length === 0,
    time: new Date().toISOString(),
  });
});

app.use('/api', (req, res, next) => {
  if (env.isProduction && env.productionConfigIssues.length > 0) {
    return res.status(503).json({
      issues: env.productionConfigIssues,
      message: 'RiseOS API is deployed, but production environment variables are incomplete.',
    });
  }

  return next();
});

app.use('/api', globalApiLimiter);
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/wealth', wealthRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

if (env.isProduction && hasClientBuild) {
  app.use(express.static(clientDistPath, { index: false, maxAge: '1y' }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      next();
      return;
    }

    res.sendFile(clientIndexPath);
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
