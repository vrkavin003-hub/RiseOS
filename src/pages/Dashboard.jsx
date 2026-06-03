import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, CheckCircle2, Crown, Sparkles } from 'lucide-react';
import ChartShell from '../components/ui/ChartShell';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import MetricCard from '../components/ui/MetricCard';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import StatPill from '../components/ui/StatPill';
import { useAuth } from '../context/AuthContext';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import {
  completionStats,
  dashboardWidgets,
  incomeData,
  scoreCards,
  user,
  weeklyProgress,
} from '../data/mockData';

const tooltipStyle = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  background: 'rgba(8,10,19,0.95)',
  color: '#fff',
};

function asScore(value, fallback) {
  if (value === null || value === undefined) return fallback;
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? Math.max(0, Math.min(100, Math.round(nextValue))) : fallback;
}

function buildScoreCards(dashboard, isLoading) {
  const values = {
    'Discipline Score': dashboard?.disciplineScore,
    'Growth Score': dashboard?.growthScore,
    'Health Score': dashboard?.healthScore,
    'Productivity Score': dashboard?.productivityScore,
    'Skill Score': dashboard?.skillScore,
    'Wealth Score': dashboard?.wealthScore,
  };

  return scoreCards.map((card) => ({
    ...card,
    delta: dashboard ? 'Live' : isLoading ? 'Syncing' : card.delta,
    value: asScore(values[card.label], card.value),
  }));
}

function buildCompletionStats(dashboard) {
  if (!dashboard) return completionStats;

  const values = {
    'Goal Completion': dashboard.goalsCompleted * 10,
    'Habit Completion': dashboard.habitCompletion,
    'Income Growth': dashboard.wealthScore,
    'Knowledge Growth': dashboard.skillScore,
  };

  return completionStats.map((stat) => ({
    ...stat,
    value: asScore(values[stat.label], stat.value),
  }));
}

function buildRecommendations(dashboard, focus) {
  if (!dashboard) return [];

  const pillars = [
    { label: 'discipline', value: asScore(dashboard.disciplineScore, 0) },
    { label: 'wealth', value: asScore(dashboard.wealthScore, 0) },
    { label: 'skill', value: asScore(dashboard.skillScore, 0) },
    { label: 'health', value: asScore(dashboard.healthScore, 0) },
    { label: 'productivity', value: asScore(dashboard.productivityScore, 0) },
  ].sort((first, second) => first.value - second.value);

  const weakest = pillars[0];
  return [
    `Primary focus: ${focus}. Keep today's work tied to that operating theme.`,
    `Lowest live pillar: ${weakest.label} at ${weakest.value}. Pick one small action there before the day closes.`,
    `${Number(dashboard.journalEntries || 0)} reviews and ${Math.round(Number(dashboard.learningHours || 0))} learning hours are currently feeding your score mix.`,
  ];
}

function CompletionGauge({ stat, index }) {
  const Icon = stat.icon;
  return (
    <GlassCard className="p-4" delay={index * 0.04}>
      <div className="flex items-center gap-4">
        <div
          className="grid size-16 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${stat.color} ${stat.value * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
          }}
        >
          <div className="grid size-12 place-items-center rounded-full bg-night">
            <Icon size={19} style={{ color: stat.color }} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{stat.label}</p>
          <p className="mt-1 text-2xl font-black text-white">{stat.value}%</p>
          <ProgressBar value={stat.value} color={stat.color} compact />
        </div>
      </div>
    </GlassCard>
  );
}

export default function Dashboard() {
  const { user: accountUser } = useAuth();
  const { dashboard, error: dashboardError, isLoading } = useDashboardSummary();
  const MissionIcon = dashboardWidgets.mission.icon;
  const displayName = accountUser?.name || user.name;
  const focus = accountUser?.goals?.[0] || user.focus || 'AI Builder';
  const syncedScoreCards = buildScoreCards(dashboard, isLoading);
  const syncedCompletionStats = buildCompletionStats(dashboard);
  const recommendations = buildRecommendations(dashboard, focus);
  const habitStreak = dashboard ? Number(dashboard.habitStreak || 0) : user.streak;
  const missionStatus = dashboard
    ? `${Number(dashboard.goalsCompleted || 0)} goals complete | ${Number(dashboard.journalEntries || 0)} reviews logged`
    : dashboardWidgets.mission.status;
  const missionBody = dashboard
    ? `Live sync: ${Math.round(Number(dashboard.learningHours || 0))} learning hours, ${habitStreak} best habit streak, and ${Number(dashboard.incomeTracked || 0).toLocaleString()} income tracked across your operating system.`
    : dashboardWidgets.mission.body;

  return (
    <div className="page-shell space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <GlassCard className="luxury-border overflow-hidden p-5 sm:p-7">
          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-champagne/25 bg-champagne/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-champagne">
                <Crown size={14} /> Executive Command
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl">
                Good Morning, <span className="gold-text">{displayName}</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-steel">
                AI motivation: your future is built through calm repetition. Today, protect one deep work block, make one higher-quality decision,
                and let visible progress do the talking.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
              <StatPill label="Streak" value={`${habitStreak} days`} icon={Sparkles} />
              <StatPill label="Level" value={accountUser?.profession || user.level} icon={Crown} tone="text-mint" />
              <StatPill label="Focus" value={focus} icon={ArrowUpRight} tone="text-azure" />
            </div>
          </div>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {syncedScoreCards.map((card, index) => (
              <MetricCard key={card.label} {...card} delay={index * 0.035} />
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
              <MissionIcon size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-champagne">{missionStatus}</p>
              <h2 className="text-xl font-bold text-white">{dashboardWidgets.mission.title}</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-steel">{missionBody}</p>
          <div className="mt-5 space-y-3">
            {dashboardWidgets.focus.map((task) => (
              <div key={task} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                <CheckCircle2 className="text-mint" size={18} />
                <p className="text-sm text-white">{task}</p>
              </div>
            ))}
          </div>
          <PremiumButton className="mt-5 w-full" icon={ArrowUpRight}>
            Start focus block
          </PremiumButton>
        </GlassCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {syncedCompletionStats.map((stat, index) => (
          <CompletionGauge key={stat.label} stat={stat} index={index} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.86fr]">
        <ChartShell title="Weekly Progress" subtitle="Growth, habit consistency, and learning hours">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyProgress}>
              <defs>
                <linearGradient id="growth" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#F7D88A" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#F7D88A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="habits" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#5EF1B6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#5EF1B6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="day" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="growth" stroke="#F7D88A" strokeWidth={3} fill="url(#growth)" />
              <Area type="monotone" dataKey="habits" stroke="#5EF1B6" strokeWidth={3} fill="url(#habits)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Income Growth Tracker" subtitle="Education-focused progress visualization">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeData}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="income" radius={[8, 8, 0, 0]}>
                {incomeData.map((entry, index) => (
                  <Cell key={entry.month} fill={index % 2 ? '#6EC6FF' : '#F7D88A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Coach" title={dashboardWidgets.coach.title} description={dashboardWidgets.coach.body} />
          <div className="grid gap-3">
            {dashboardWidgets.achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.label} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                  <Icon className={achievement.tone} size={19} />
                  <span className="text-sm font-semibold text-white">{achievement.label}</span>
                </div>
              );
            })}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Challenge" title={dashboardWidgets.dailyChallenge.title} description={dashboardWidgets.dailyChallenge.body} />
          <div className="rounded-[8px] border border-champagne/20 bg-champagne/10 p-4">
            <p className="text-sm font-bold text-champagne">{dashboardWidgets.dailyChallenge.reward}</p>
            <p className="mt-2 text-sm text-steel">Complete before 8 PM to protect your streak and unlock a coach review.</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <SectionHeader eyebrow="System" title="AI recommendation cards" description="Next best actions generated from your current score mix." />
          {isLoading && <LoadingSkeleton rows={2} />}
          {!isLoading && dashboardError && (
            <div className="rounded-[8px] border border-ember/25 bg-ember/10 p-4">
              <p className="text-sm font-bold text-ember">Live dashboard unavailable</p>
              <p className="mt-2 text-sm leading-6 text-steel">{dashboardError}. Showing local defaults until the API syncs again.</p>
            </div>
          )}
          {!isLoading && !dashboardError && (
            <div className="grid gap-3">
              {recommendations.map((recommendation) => (
                <div key={recommendation} className="flex items-start gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                  <CheckCircle2 className="mt-0.5 text-mint" size={18} />
                  <p className="text-sm leading-6 text-white">{recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <ChartShell title="Knowledge Growth Tracker" subtitle="Learning momentum by category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'AI', value: 34, fill: '#F7D88A' },
                  { name: 'Product', value: 24, fill: '#6EC6FF' },
                  { name: 'Finance', value: 18, fill: '#5EF1B6' },
                  { name: 'Sales', value: 14, fill: '#FF6B4A' },
                  { name: 'Health', value: 10, fill: '#B38CFF' },
                ]}
                innerRadius={58}
                outerRadius={92}
                paddingAngle={5}
                dataKey="value"
              />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartShell>
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Vault" title="Recent achievements" description="A lightweight record of wins that compound confidence and consistency." />
          <EmptyState title="No archived reports yet" body="Your saved executive reviews and AI-generated weekly reports will appear here." action="Generate report" />
        </GlassCard>
      </section>
    </div>
  );
}
