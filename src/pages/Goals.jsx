import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Plus, Target, Trash2, Trophy } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBanner from '../components/ui/StatusBanner';
import { useGoals } from '../hooks/useGoals';

const categories = [
  { color: '#6EC6FF', label: 'Career', value: 'career' },
  { color: '#F7D88A', label: 'Business', value: 'business' },
  { color: '#5EF1B6', label: 'Health', value: 'health' },
  { color: '#B38CFF', label: 'Learning', value: 'learning' },
  { color: '#FF6B4A', label: 'Financial', value: 'financial' },
];

const categoryMeta = Object.fromEntries(categories.map((category) => [category.value, category]));

const initialForm = {
  category: 'career',
  deadline: '',
  description: '',
  milestones: '',
  progress: '0',
  title: '',
};

function clampProgress(value) {
  const nextValue = Number(value);
  if (!Number.isFinite(nextValue)) return 0;
  return Math.max(0, Math.min(100, Math.round(nextValue)));
}

function buildMilestones(value) {
  return value
    .split(',')
    .map((milestone) => milestone.trim())
    .filter(Boolean)
    .map((title) => ({ completed: false, title }));
}

function formatDeadline(goal) {
  if (goal.status === 'completed') return 'Complete';
  if (!goal.deadline) return 'No deadline';

  const deadline = new Date(goal.deadline);
  if (Number.isNaN(deadline.getTime())) return 'No deadline';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);

  const days = Math.ceil((deadline - today) / 86400000);
  if (days < 0) return 'Past deadline';
  if (days === 0) return 'Due today';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

function completedMilestones(goal) {
  return goal.milestones?.filter((milestone) => milestone.completed).length || 0;
}

function GoalCard({ busy, goal, onAdvance, onDelete, onMilestoneToggle, onStatusToggle }) {
  const meta = categoryMeta[goal.category] || categoryMeta.career;
  const progress = clampProgress(goal.progress);
  const totalMilestones = goal.milestones?.length || 0;

  return (
    <GlassCard className="p-5 transition hover:-translate-y-1 hover:border-champagne/30">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-bold text-steel">{meta.label}</span>
          <h2 className="mt-3 text-xl font-black text-white">{goal.title}</h2>
          {goal.description && <p className="mt-2 text-sm leading-6 text-steel">{goal.description}</p>}
        </div>
        <div className="flex items-center gap-2 rounded-[8px] border border-champagne/20 bg-champagne/10 px-3 py-2 text-sm font-bold text-champagne">
          <CalendarClock size={16} />
          {formatDeadline(goal)}
        </div>
      </div>

      <ProgressBar label="Goal progress" value={progress} color={meta.color} />

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {totalMilestones > 0 ? (
          goal.milestones.map((milestone) => (
            <button
              className={`focus-ring rounded-[8px] border p-3 text-left text-sm font-semibold transition ${
                milestone.completed ? 'border-mint/25 bg-mint/10 text-mint' : 'border-white/10 bg-white/[0.045] text-steel hover:border-champagne/30'
              }`}
              disabled={busy}
              key={milestone._id || milestone.title}
              onClick={() => onMilestoneToggle(goal, milestone)}
              type="button"
            >
              {milestone.title}
            </button>
          ))
        ) : (
          <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3 text-sm font-semibold text-steel sm:col-span-3">
            No milestones yet
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-steel">
          {completedMilestones(goal)} of {totalMilestones} milestones complete
        </p>
        <div className="flex flex-wrap gap-2">
          <PremiumButton disabled={busy || progress >= 100} onClick={() => onAdvance(goal)} type="button" variant="ghost">
            Advance 10%
          </PremiumButton>
          <PremiumButton disabled={busy} onClick={() => onStatusToggle(goal)} type="button" variant={goal.status === 'completed' ? 'subtle' : 'gold'}>
            {goal.status === 'completed' ? 'Reopen' : 'Complete'}
          </PremiumButton>
          <PremiumButton disabled={busy} icon={Trash2} onClick={() => onDelete(goal._id)} type="button" variant="subtle">
            Delete
          </PremiumButton>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Goals() {
  const { createGoal, deleteGoal, error, goals, isCreating, isLoading, mutatingId, updateGoal } = useGoals();
  const [form, setForm] = useState(initialForm);

  const summary = useMemo(() => {
    const completed = goals.filter((goal) => goal.status === 'completed' || clampProgress(goal.progress) >= 100).length;
    const average = goals.length ? Math.round(goals.reduce((total, goal) => total + clampProgress(goal.progress), 0) / goals.length) : 0;
    const onTrack = goals.filter((goal) => goal.status === 'active' && clampProgress(goal.progress) >= 70).length;

    return { average, completed, onTrack };
  }, [goals]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();

    const payload = {
      category: form.category,
      description: form.description,
      milestones: buildMilestones(form.milestones),
      progress: clampProgress(form.progress),
      status: clampProgress(form.progress) >= 100 ? 'completed' : 'active',
      title: form.title,
    };

    if (form.deadline) payload.deadline = form.deadline;

    try {
      await createGoal(payload);
      setForm(initialForm);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleAdvance(goal) {
    const nextProgress = clampProgress(clampProgress(goal.progress) + 10);

    try {
      await updateGoal(goal._id, {
        progress: nextProgress,
        status: nextProgress >= 100 ? 'completed' : 'active',
      });
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleStatusToggle(goal) {
    const completed = goal.status !== 'completed';

    try {
      await updateGoal(goal._id, {
        progress: completed ? 100 : Math.min(clampProgress(goal.progress), 90),
        status: completed ? 'completed' : 'active',
      });
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleMilestoneToggle(goal, milestone) {
    const milestones = goal.milestones.map((item) => ({
      _id: item._id,
      completed: item._id === milestone._id ? !item.completed : item.completed,
      title: item.title,
    }));
    const progress = milestones.length ? Math.round((milestones.filter((item) => item.completed).length / milestones.length) * 100) : clampProgress(goal.progress);

    try {
      await updateGoal(goal._id, {
        milestones,
        progress,
        status: progress >= 100 ? 'completed' : 'active',
      });
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleDeleteGoal(id) {
    try {
      await deleteGoal(id);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Goals"
        title="Milestones, predictions, and achievement momentum"
        description="Track career, business, health, learning, and financial goals with progress, milestone visibility, completion predictions, and a timeline of wins."
        action={
          <PremiumButton disabled={isCreating} form="goal-create-form" icon={Target} type="submit">
            {isCreating ? 'Creating...' : 'Create goal'}
          </PremiumButton>
        }
      />

      <GlassCard className="p-5">
        <StatusBanner className="mb-4">{error}</StatusBanner>
        <form id="goal-create-form" className="grid gap-4" onSubmit={handleCreate}>
          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.8fr_0.7fr_0.7fr]">
            <label className="block">
              <span className="text-xs font-semibold text-steel">Goal title</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white placeholder:text-steel"
                name="title"
                onChange={handleChange}
                placeholder="Validate first SaaS revenue"
                required
                value={form.title}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-steel">Category</span>
              <select
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-ink px-4 py-3 text-sm text-white"
                name="category"
                onChange={handleChange}
                value={form.category}
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-steel">Deadline</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white"
                name="deadline"
                onChange={handleChange}
                type="date"
                value={form.deadline}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-steel">Progress</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white"
                max="100"
                min="0"
                name="progress"
                onChange={handleChange}
                type="number"
                value={form.progress}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-steel">Description</span>
            <textarea
              className="focus-ring mt-2 min-h-20 w-full resize-y rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-white placeholder:text-steel"
              name="description"
              onChange={handleChange}
              placeholder="Define the outcome, constraints, and why it matters."
              value={form.description}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-steel">Milestones</span>
            <input
              className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white placeholder:text-steel"
              name="milestones"
              onChange={handleChange}
              placeholder="Landing page, 10 calls, Paid pilot"
              value={form.milestones}
            />
          </label>
          <div className="flex justify-end">
            <PremiumButton disabled={isCreating} icon={Plus} type="submit">
              {isCreating ? 'Creating...' : 'Save goal'}
            </PremiumButton>
          </div>
        </form>
      </GlassCard>

      <section className="grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          <>
            <LoadingSkeleton rows={3} />
            <LoadingSkeleton rows={3} />
          </>
        ) : goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard
              busy={mutatingId === goal._id}
              goal={goal}
              key={goal._id}
              onAdvance={handleAdvance}
              onDelete={handleDeleteGoal}
              onMilestoneToggle={handleMilestoneToggle}
              onStatusToggle={handleStatusToggle}
            />
          ))
        ) : (
          <div className="lg:col-span-2">
            <EmptyState title="No goals yet" body="Create one measurable outcome with a few milestones to start building a real progress trail." action="Create goal" />
          </div>
        )}
      </section>

      <GlassCard className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[8px] bg-gold-line text-night">
              <Trophy size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-champagne">Completion prediction</p>
              <h2 className="text-xl font-black text-white">{summary.onTrack} goals are on track this month</h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 text-mint">
              <CheckCircle2 size={18} />
              {summary.average}% average progress
            </span>
            <span className="text-champagne">{summary.completed} complete</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
