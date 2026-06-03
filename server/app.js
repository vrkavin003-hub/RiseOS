import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
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

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    credentials: true,
    origin: env.clientUrl,
  }),
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

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
  res.json({ name: 'RiseOS AI API', ok: true, time: new Date().toISOString() });
});

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

app.use(notFound);
app.use(errorHandler);

export default app;
