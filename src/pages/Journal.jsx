import { useMemo, useState } from 'react';
import { Brain, CheckCircle2, Save, Sparkles } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PremiumButton from '../components/ui/PremiumButton';
import SectionHeader from '../components/ui/SectionHeader';
import { useJournalEntries } from '../hooks/useJournalEntries';

const initialForm = {
  expenses: '',
  failures: '',
  focusScore: '7',
  healthActivity: '',
  income: '',
  lessons: '',
  mood: 'neutral',
  networkingActivity: '',
  timeSpentLearning: '',
  whatIBuilt: '',
  whatILearned: '',
  wins: '',
};

const journalFields = [
  {
    label: 'What I Learned Today',
    name: 'whatILearned',
    placeholder: 'Studied AI agent evaluation patterns and prompt testing workflows.',
  },
  {
    label: 'What I Built Today',
    name: 'whatIBuilt',
    placeholder: 'Completed the first version of a premium dashboard UI.',
  },
  {
    label: 'Wins',
    name: 'wins',
    placeholder: 'Protected deep work and completed my daily planning ritual.',
  },
  {
    label: 'Failures',
    name: 'failures',
    placeholder: 'Delayed outreach because product polish felt easier than sales discomfort.',
  },
  {
    label: 'Lessons',
    name: 'lessons',
    placeholder: 'Shipping matters, but feedback loops matter even more.',
  },
  {
    label: 'Networking Activity',
    name: 'networkingActivity',
    placeholder: 'Commented on two founder posts and bookmarked three potential mentors.',
  },
  {
    label: 'Health Activity',
    name: 'healthActivity',
    placeholder: '35-minute strength session and 8,200 steps.',
  },
];

function toNumber(value) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function formatEntryDate(value) {
  if (!value) return 'New entry';

  return new Date(value).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

function buildAnalysisItems(entry) {
  const analysis = entry?.aiAnalysis;
  if (!analysis) return [];

  return [
    { label: 'Strengths', body: analysis.strengths },
    { label: 'Weaknesses', body: analysis.weaknesses },
    { label: 'Opportunities', body: analysis.opportunities },
    { label: "Tomorrow's Action Plan", body: analysis.tomorrowPlan },
  ].filter((item) => item.body);
}

function buildWeek(entries) {
  const completedDays = new Set(entries.map((entry) => new Date(entry.createdAt).toDateString()));
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      active: completedDays.has(date.toDateString()),
      key: date.toISOString(),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1),
    };
  });
}

export default function Journal() {
  const { createEntry, entries, error, isCreating, isLoading } = useJournalEntries();
  const [form, setForm] = useState(initialForm);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const activeEntry = selectedEntry || entries[0] || null;
  const analysisItems = buildAnalysisItems(activeEntry);
  const week = useMemo(() => buildWeek(entries), [entries]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...form,
      expenses: toNumber(form.expenses),
      focusScore: toNumber(form.focusScore),
      income: toNumber(form.income),
      timeSpentLearning: toNumber(form.timeSpentLearning),
    };

    try {
      const entry = await createEntry(payload);
      setSelectedEntry(entry);
      setForm(initialForm);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Daily Journal"
        title="Turn reflection into tomorrow's edge"
        description="Log learning, building, wins, failures, money signals, networking, and health activity. The AI analysis panel converts the day into useful feedback."
        action={
          <PremiumButton disabled={isCreating} form="journal-entry-form" icon={Save} type="submit">
            {isCreating ? 'Analyzing...' : 'Analyze day'}
          </PremiumButton>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.12fr_0.88fr]">
        <GlassCard className="p-5">
          {error && (
            <div className="mb-4 rounded-[8px] border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember" role="alert">
              {error}
            </div>
          )}
          <form id="journal-entry-form" className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-4">
              <label className="block">
                <span className="text-xs font-semibold text-steel">Mood</span>
                <select
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-ink px-3 py-3 text-sm text-white"
                  name="mood"
                  onChange={handleChange}
                  value={form.mood}
                >
                  <option value="focused">Focused</option>
                  <option value="neutral">Neutral</option>
                  <option value="tired">Tired</option>
                  <option value="energized">Energized</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-steel">Learning hours</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white placeholder:text-steel"
                  min="0"
                  name="timeSpentLearning"
                  onChange={handleChange}
                  placeholder="2.5"
                  step="0.25"
                  type="number"
                  value={form.timeSpentLearning}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-steel">Income</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white placeholder:text-steel"
                  min="0"
                  name="income"
                  onChange={handleChange}
                  placeholder="250"
                  step="0.01"
                  type="number"
                  value={form.income}
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-steel">Expenses</span>
                <input
                  className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white placeholder:text-steel"
                  min="0"
                  name="expenses"
                  onChange={handleChange}
                  placeholder="24"
                  step="0.01"
                  type="number"
                  value={form.expenses}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-steel">Focus score</span>
              <input
                className="focus-ring mt-2 w-full accent-champagne"
                max="10"
                min="0"
                name="focusScore"
                onChange={handleChange}
                type="range"
                value={form.focusScore}
              />
              <span className="mt-1 block text-sm font-bold text-white">{form.focusScore}/10</span>
            </label>

            {journalFields.map((field) => (
              <label key={field.name} className="block">
                <span className="flex items-center gap-2 text-sm font-bold text-white">
                  <CheckCircle2 size={16} className="text-champagne" />
                  {field.label}
                </span>
                <textarea
                  className="focus-ring mt-2 min-h-24 w-full resize-y rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-white placeholder:text-steel"
                  name={field.name}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                />
              </label>
            ))}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-steel">Saved to your account and reflected in dashboard scores after analysis.</p>
              <PremiumButton disabled={isCreating} icon={Sparkles} type="submit">
                {isCreating ? 'Submitting...' : 'Submit and analyze'}
              </PremiumButton>
            </div>
          </form>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
                <Brain size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-champagne">AI Analysis Panel</p>
                <h2 className="text-xl font-bold text-white">{activeEntry ? 'Latest decision intelligence' : 'Waiting for submission'}</h2>
              </div>
            </div>

            {isLoading ? (
              <div className="mt-5">
                <LoadingSkeleton rows={3} />
              </div>
            ) : analysisItems.length > 0 ? (
              <div className="mt-5 space-y-3">
                {analysisItems.map((item) => (
                  <div key={item.label} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                    <h3 className="text-sm font-bold text-white">{item.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-steel">{item.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState title="No analysis yet" body="Submit your journal to reveal strengths, weaknesses, opportunities, and tomorrow's action plan." action="Analyze" />
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader eyebrow="Streak" title="Reflection consistency" description="Journaling four or more days per week improves the quality of AI coaching recommendations." />
            <div className="grid grid-cols-7 gap-2">
              {week.map((day) => (
                <div
                  key={day.key}
                  className={`grid aspect-square place-items-center rounded-[8px] border text-sm font-bold ${
                    day.active ? 'border-champagne/30 bg-champagne/15 text-champagne' : 'border-white/10 bg-white/[0.045] text-steel'
                  }`}
                >
                  {day.label}
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader eyebrow="History" title="Recent entries" description="Select a saved reflection to review its AI analysis." />
            {isLoading ? (
              <LoadingSkeleton rows={3} />
            ) : entries.length > 0 ? (
              <div className="grid gap-3">
                {entries.slice(0, 5).map((entry) => (
                  <button
                    className="focus-ring rounded-[8px] border border-white/10 bg-white/[0.045] p-3 text-left transition hover:border-champagne/35 hover:bg-white/8"
                    key={entry._id}
                    onClick={() => setSelectedEntry(entry)}
                    type="button"
                  >
                    <p className="text-sm font-bold text-white">{formatEntryDate(entry.createdAt)}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-steel">{entry.wins || entry.whatIBuilt || entry.whatILearned || 'Reflection saved'}</p>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState title="No journal history" body="Your saved reflections will appear here after your first submitted entry." action="Create entry" />
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
