import Goal from '../models/Goal.js';
import Habit from '../models/Habit.js';
import News from '../models/News.js';
import Notification from '../models/Notification.js';
import { calculateDashboard } from './dashboardService.js';
import { emitToUser } from './realtime.js';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfIsoWeek(date) {
  const day = startOfUtcDay(date);
  const weekday = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() - weekday + 1);
  return day;
}

function periodStart(date, frequency) {
  if (frequency === 'weekly') return startOfIsoWeek(date);
  if (frequency === 'monthly') return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return startOfUtcDay(date);
}

function periodKey(date, frequency) {
  const start = periodStart(date, frequency);
  return start.toISOString().slice(0, frequency === 'monthly' ? 7 : 10);
}

function habitCompleteForCurrentPeriod(habit) {
  const target = Math.max(1, Number(habit.targetPerPeriod || 1));
  const currentKey = periodKey(new Date(), habit.frequency);
  const done = habit.completions.filter((completion) => periodKey(new Date(completion.completedAt), habit.frequency) === currentKey).length;
  return done >= target;
}

function daysUntil(value) {
  const today = startOfUtcDay(new Date());
  const deadline = startOfUtcDay(new Date(value));
  return Math.ceil((deadline - today) / MS_PER_DAY);
}

function notificationEnabled(user, key) {
  return user?.notificationSettings?.[key] !== false;
}

export async function createNotification({ body = '', metadata = {}, metadataKey = '', title, type = 'system', user }) {
  const notification = await Notification.create({ body, metadata, metadataKey, title, type, user });
  emitToUser(user, 'notification:new', notification);
  return notification;
}

export async function upsertNotification({ body = '', metadata = {}, metadataKey, title, type = 'system', user }) {
  const notification = await Notification.findOneAndUpdate(
    { metadataKey, user },
    {
      $setOnInsert: { body, metadata, metadataKey, read: false, title, type, user },
    },
    { new: true, upsert: true },
  );

  if (notification.createdAt && notification.createdAt.getTime() === notification.updatedAt.getTime()) {
    emitToUser(user, 'notification:new', notification);
  }

  return notification;
}

export async function generateAutomatedNotifications(user) {
  const created = [];
  const todayKey = dateKey();

  if (notificationEnabled(user, 'goals')) {
    const goals = await Goal.find({ status: { $ne: 'completed' }, user: user._id }).sort({ deadline: 1 }).limit(20);
    const urgentGoals = goals.filter((goal) => goal.deadline && daysUntil(goal.deadline) <= 3);

    for (const goal of urgentGoals) {
      const days = daysUntil(goal.deadline);
      const title = days < 0 ? 'Goal deadline passed' : days === 0 ? 'Goal due today' : 'Goal deadline approaching';
      const body = days < 0
        ? `${goal.title} is past deadline. Re-plan the next concrete action.`
        : `${goal.title} is due ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}.`;
      created.push(
        await upsertNotification({
          body,
          metadata: { goalId: goal._id },
          metadataKey: `goal:${goal._id}:deadline:${todayKey}`,
          title,
          type: 'goal',
          user: user._id,
        }),
      );
    }
  }

  if (notificationEnabled(user, 'habits')) {
    const habits = await Habit.find({ isArchived: { $ne: true }, user: user._id }).sort({ createdAt: -1 }).limit(20);
    const incompleteHabits = habits.filter((habit) => !habitCompleteForCurrentPeriod(habit)).slice(0, 3);

    for (const habit of incompleteHabits) {
      const key = periodKey(new Date(), habit.frequency);
      created.push(
        await upsertNotification({
          body: `${habit.name} still needs a ${habit.frequency} completion to protect momentum.`,
          metadata: { habitId: habit._id },
          metadataKey: `habit:${habit._id}:period:${key}`,
          title: 'Habit reminder',
          type: 'habit',
          user: user._id,
        }),
      );
    }
  }

  if (notificationEnabled(user, 'news')) {
    const topNews = await News.find({}).sort({ publishedAt: -1, createdAt: -1 }).limit(1);
    if (topNews[0]) {
      created.push(
        await upsertNotification({
          body: topNews[0].summary || 'A new briefing is available in News Intelligence.',
          metadata: { newsId: topNews[0]._id },
          metadataKey: `news:${topNews[0]._id}`,
          title: 'News briefing ready',
          type: 'news',
          user: user._id,
        }),
      );
    }
  }

  if (notificationEnabled(user, 'aiAdvice')) {
    const dashboard = await calculateDashboard(user._id);
    const scores = [
      ['Discipline', dashboard.disciplineScore],
      ['Health', dashboard.healthScore],
      ['Productivity', dashboard.productivityScore],
      ['Skill', dashboard.skillScore],
      ['Wealth', dashboard.wealthScore],
    ];
    const [weakestLabel, weakestScore] = scores.sort((first, second) => first[1] - second[1])[0];
    const body =
      weakestScore <= 50
        ? `${weakestLabel} is your lowest score today. Ask the AI Coach for one practical recovery plan.`
        : `Your next leverage point is ${weakestLabel}. Turn it into one concrete action today.`;

    created.push(
      await upsertNotification({
        body,
        metadata: { dashboard },
        metadataKey: `ai:daily:${todayKey}`,
        title: 'AI recommendation',
        type: 'ai',
        user: user._id,
      }),
    );
  }

  return created.filter(Boolean);
}
