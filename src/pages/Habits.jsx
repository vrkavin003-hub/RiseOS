import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Archive, CalendarCheck, CheckCircle2, Flame, Plus, RotateCcw, Target, Trash2 } from 'lucide-react';
import ChartShell from '../components/ui/ChartShell';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBanner from '../components/ui/StatusBanner';
import { useHabits } from '../hooks/useHabits';

const tooltipStyle = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  background: 'rgba(8,10,19,0.95)',
  color: '#fff',
};

const categories = [
  { color: '#6EC6FF', label: 'Career', value: 'career' },
  { color: '#FF6B4A', label: 'Discipline', value: 'discipline' },
  { color: '#5EF1B6', label: 'Finance', value: 'finance' },
  { color: '#B38CFF', label: 'Health', value: 'health' },
  { color: '#F7D88A', label: 'Learning', value: 'learning' },
  { color: '#6EC6FF', label: 'Productivity', value: 'productivity' },
  { color: '#94A3B8', label: 'Other', value: 'other' },
];

const categoryMeta = Object.fromEntries(categories.map((category) => [category.value, category]));

const frequencies = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const periodLabels = {
  daily: 'today',
  monthly: 'this month',
  weekly: 'this week',
};

const initialForm = {
  category: 'productivity',
  description: '',
  frequency: 'daily',
  name: '',
  targetPerPeriod: '1',
};

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

function toTarget(value) {
  const target = Number(value);
  if (!Number.isFinite(target)) return 1;
  return Math.max(1, Math.min(20, Math.round(target)));
}

function completionsThisPeriod(habit) {
  const key = periodKey(new Date(), habit.frequency);
  return (habit.completions || []).filter((completion) => periodKey(new Date(completion.completedAt), habit.frequency) === key).length;
}

function latestCompletion(habit) {
  return [...(habit.completions || [])].sort((first, second) => new Date(second.completedAt) - new Date(first.completedAt))[0];
}

function formatCompletionDate(value) {
  if (!value) return 'No completions';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function HabitCard({ busy, habit, note, onArchiveToggle, onComplete, onDelete, onNoteChange, onUndo }) {
  const meta = categoryMeta[habit.category] || categoryMeta.productivity;
  const target = toTarget(habit.targetPerPeriod);
  const done = completionsThisPeriod(habit);
  const progress = Math.min(100, Math.round((done / target) * 100));
  const currentComplete = done >= target;
  const lastCompletion = latestCompletion(habit);

  return (
    <GlassCard className={`p-5 transition hover:-translate-y-1 hover:border-champagne/30 ${habit.isArchived ? 'opacity-70' : ''}`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-bold text-steel">{meta.label}</span>
            <span className="rounded-full border border-champagne/20 bg-champagne/10 px-3 py-1 text-xs font-bold text-champagne">{habit.frequency}</span>
            {habit.isArchived && <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-bold text-steel">Archived</span>}
          </div>
          <h2 className="mt-3 text-xl font-black text-white">{habit.name}</h2>
          {habit.description && <p className="mt-2 text-sm leading-6 text-steel">{habit.description}</p>}
        </div>
        <div className="grid min-w-24 place-items-center rounded-[8px] border border-mint/20 bg-mint/10 px-3 py-2 text-center">
          <span className="text-2xl font-black text-mint">{habit.currentStreak || 0}</span>
          <span className="text-xs font-bold text-steel">current streak</span>
        </div>
      </div>

      <ProgressBar label={`${done} of ${target} done ${periodLabels[habit.frequency]}`} value={progress} color={meta.color} />

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Metric label="Longest streak" value={habit.longestStreak || 0} />
        <Metric label="Total completions" value={habit.completions?.length || 0} />
        <Metric label="Last logged" value={formatCompletionDate(lastCompletion?.completedAt)} compact />
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-semibold text-steel">Completion note</span>
        <input
          className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white placeholder:text-steel"
          disabled={busy || currentComplete || habit.isArchived}
          onChange={(event) => onNoteChange(habit._id, event.target.value)}
          placeholder="Optional note for this completion"
          value={note || ''}
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-2">
        <PremiumButton disabled={busy || currentComplete || habit.isArchived} icon={CheckCircle2} onClick={() => onComplete(habit)} type="button">
          {currentComplete ? 'Period complete' : 'Log completion'}
        </PremiumButton>
        <PremiumButton disabled={busy || !lastCompletion} icon={RotateCcw} onClick={() => onUndo(habit, lastCompletion)} type="button" variant="ghost">
          Undo latest
        </PremiumButton>
        <PremiumButton disabled={busy} icon={Archive} onClick={() => onArchiveToggle(habit)} type="button" variant="subtle">
          {habit.isArchived ? 'Restore' : 'Archive'}
        </PremiumButton>
        <PremiumButton disabled={busy} icon={Trash2} onClick={() => onDelete(habit._id)} type="button" variant="subtle">
          Delete
        </PremiumButton>
      </div>
    </GlassCard>
  );
}

export default function Habits() {
  const { analytics, completeHabit, createHabit, deleteHabit, error, habits, isCreating, isLoading, mutatingId, removeCompletion, updateHabit } = useHabits();
  const [form, setForm] = useState(initialForm);
  const [notes, setNotes] = useState({});

  const activeHabits = useMemo(() => habits.filter((habit) => !habit.isArchived), [habits]);
  const archivedHabits = useMemo(() => habits.filter((habit) => habit.isArchived), [habits]);
  const weeklyData = useMemo(() => analytics?.weekly || [], [analytics]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();

    try {
      await createHabit({
        category: form.category,
        description: form.description,
        frequency: form.frequency,
        name: form.name,
        targetPerPeriod: toTarget(form.targetPerPeriod),
      });
      setForm(initialForm);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleComplete(habit) {
    try {
      await completeHabit(habit._id, { note: notes[habit._id] || '' });
      setNotes((current) => ({ ...current, [habit._id]: '' }));
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleUndo(habit, completion) {
    if (!completion?._id) return;

    try {
      await removeCompletion(habit._id, completion._id);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleArchiveToggle(habit) {
    try {
      await updateHabit(habit._id, { isArchived: !habit.isArchived });
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleDelete(id) {
    try {
      await deleteHabit(id);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Habits"
        title="Daily, weekly, and monthly discipline tracking"
        description="Create habits, log period completions, protect streaks, and review weekly and monthly consistency from real account activity."
        action={
          <PremiumButton disabled={isCreating} form="habit-create-form" icon={CalendarCheck} type="submit">
            {isCreating ? 'Creating...' : 'Create habit'}
          </PremiumButton>
        }
      />

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard icon={Target} label="Active habits" value={analytics?.activeHabits || 0} />
        <SummaryCard icon={CheckCircle2} label="Current period" value={`${analytics?.completionRate || 0}%`} />
        <SummaryCard icon={Flame} label="Best streak" value={analytics?.bestStreak || 0} />
        <SummaryCard icon={CalendarCheck} label="Total completions" value={analytics?.totalCompletions || 0} />
      </section>

      <GlassCard className="p-5">
        <StatusBanner className="mb-4">{error}</StatusBanner>
        <form id="habit-create-form" className="grid gap-4" onSubmit={handleCreate}>
          <div className="grid gap-3 lg:grid-cols-[1fr_0.7fr_0.7fr_0.55fr]">
            <label className="block">
              <span className="text-xs font-semibold text-steel">Habit name</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white placeholder:text-steel"
                name="name"
                onChange={handleChange}
                placeholder="Deep work block"
                required
                value={form.name}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-steel">Category</span>
              <select className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-ink px-4 py-3 text-sm text-white" name="category" onChange={handleChange} value={form.category}>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-steel">Frequency</span>
              <select className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-ink px-4 py-3 text-sm text-white" name="frequency" onChange={handleChange} value={form.frequency}>
                {frequencies.map((frequency) => (
                  <option key={frequency.value} value={frequency.value}>
                    {frequency.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-steel">Target</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white"
                max="20"
                min="1"
                name="targetPerPeriod"
                onChange={handleChange}
                type="number"
                value={form.targetPerPeriod}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-steel">Description</span>
            <textarea
              className="focus-ring mt-2 min-h-20 w-full resize-y rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-white placeholder:text-steel"
              name="description"
              onChange={handleChange}
              placeholder="Define the trigger, minimum viable action, and why this habit matters."
              value={form.description}
            />
          </label>
          <div className="flex justify-end">
            <PremiumButton disabled={isCreating} icon={Plus} type="submit">
              {isCreating ? 'Creating...' : 'Save habit'}
            </PremiumButton>
          </div>
        </form>
      </GlassCard>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartShell title="Weekly Tracking" subtitle="Completion rate across the last seven days">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="day" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="rate" fill="#F7D88A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Monthly Tracking" title="30-day consistency" />
          <ProgressBar label="Days with habit evidence" value={analytics?.monthly?.rate || 0} color="#5EF1B6" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Completed days" value={analytics?.monthly?.completedDays || 0} />
            <Metric label="Tracked window" value={`${analytics?.monthly?.totalDays || 30} days`} />
          </div>
          <div className="mt-5 rounded-[8px] border border-mint/20 bg-mint/10 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-mint">
              <Flame size={16} />
              Streak calculation
            </div>
            <p className="mt-2 text-sm leading-6 text-steel">Streaks recalculate from period completions, so missed days, weeks, or months are reflected without manual correction.</p>
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          <>
            <LoadingSkeleton rows={3} />
            <LoadingSkeleton rows={3} />
          </>
        ) : activeHabits.length > 0 ? (
          activeHabits.map((habit) => (
            <HabitCard
              busy={mutatingId === habit._id}
              habit={habit}
              key={habit._id}
              note={notes[habit._id]}
              onArchiveToggle={handleArchiveToggle}
              onComplete={handleComplete}
              onDelete={handleDelete}
              onNoteChange={(id, value) => setNotes((current) => ({ ...current, [id]: value }))}
              onUndo={handleUndo}
            />
          ))
        ) : (
          <div className="lg:col-span-2">
            <EmptyState title="No active habits yet" body="Create one discipline loop and log the first completion for this period." action="Create habit" />
          </div>
        )}
      </section>

      {archivedHabits.length > 0 && (
        <section className="space-y-3">
          <SectionHeader eyebrow="Archive" title="Paused habits" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {archivedHabits.map((habit) => (
              <div key={habit._id} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{habit.name}</p>
                    <p className="mt-1 text-xs font-semibold text-steel">{habit.frequency}</p>
                  </div>
                  <PremiumButton disabled={mutatingId === habit._id} onClick={() => handleArchiveToggle(habit)} type="button" variant="ghost">
                    Restore
                  </PremiumButton>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Metric({ compact = false, label, value }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
      <p className="text-xs font-semibold text-steel">{label}</p>
      <p className={`mt-1 font-black text-white ${compact ? 'text-sm' : 'text-xl'}`}>{value}</p>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold text-steel">{label}</p>
          <p className="mt-1 text-2xl font-black text-white">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
}
