import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BookOpen, GraduationCap, Plus, Sparkles, Trash2, TrendingUp } from 'lucide-react';
import ChartShell from '../components/ui/ChartShell';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBanner from '../components/ui/StatusBanner';
import { learningRecommendations, skillProgressData, skillTracks } from '../data/mockData';
import { useSkills } from '../hooks/useSkills';

const tooltipStyle = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  background: 'rgba(8,10,19,0.95)',
  color: '#fff',
};

const categories = [
  'Programming',
  'AI',
  'Communication',
  'Leadership',
  'Marketing',
  'Sales',
  'Finance',
  'Business Strategy',
  'Networking',
  'Other',
];

const categoryColors = {
  AI: '#F7D88A',
  'Business Strategy': '#5EF1B6',
  Communication: '#B38CFF',
  Finance: '#6EC6FF',
  Leadership: '#5EF1B6',
  Marketing: '#F7D88A',
  Networking: '#FF6B4A',
  Other: '#94A3B8',
  Programming: '#6EC6FF',
  Sales: '#FF6B4A',
};

const initialForm = {
  category: 'Programming',
  learningHours: '',
  notes: '',
  progress: '0',
  recommendations: '',
};

function clampProgress(value) {
  const nextValue = Number(value);
  if (!Number.isFinite(nextValue)) return 0;
  return Math.max(0, Math.min(100, Math.round(nextValue)));
}

function toNumber(value) {
  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function getLevel(progress) {
  if (progress >= 85) return 'Advanced';
  if (progress >= 60) return 'Intermediate';
  if (progress >= 35) return 'Growing';
  return 'Foundational';
}

function buildRecommendations(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildTrack(skill) {
  const progress = clampProgress(skill.progress);

  return {
    ...skill,
    color: categoryColors[skill.category] || categoryColors.Other,
    level: getLevel(progress),
    name: skill.category,
    progress,
    weeklyGrowth: `${Number(skill.learningHours || 0)}h logged`,
  };
}

function buildRadarData(tracks) {
  return tracks.map((skill) => ({
    progress: skill.progress,
    skill: skill.name.replace('Business Strategy', 'Strategy'),
  }));
}

function buildLearningSignal(tracks) {
  if (!tracks.length) {
    return {
      body: 'Create your first skill track to turn learning hours and practice progress into dashboard momentum.',
      title: 'Start with one valuable skill',
    };
  }

  const weakest = [...tracks].sort((first, second) => first.progress - second.progress)[0];
  const strongest = [...tracks].sort((first, second) => second.progress - first.progress)[0];

  return {
    body: `${strongest.name} is your strongest tracked skill. The highest ROI improvement is a focused practice block for ${weakest.name}.`,
    title: `${weakest.name} needs deliberate practice`,
  };
}

function SkillCard({ busy, onDelete, onLogHour, onProgress, skill }) {
  return (
    <GlassCard className="p-4 transition hover:-translate-y-1 hover:border-champagne/30">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">{skill.name}</h2>
          <p className="mt-1 text-xs font-semibold text-steel">{skill.level}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-bold text-mint">{skill.weeklyGrowth}</span>
      </div>
      <ProgressBar label="Skill Level" value={skill.progress} color={skill.color} />
      {skill.notes && <p className="mt-4 text-sm leading-6 text-steel">{skill.notes}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <PremiumButton disabled={busy || skill.progress >= 100} onClick={() => onProgress(skill)} type="button" variant="ghost">
          Advance 10%
        </PremiumButton>
        <PremiumButton disabled={busy} onClick={() => onLogHour(skill)} type="button" variant="subtle">
          Log hour
        </PremiumButton>
        <PremiumButton disabled={busy} icon={Trash2} onClick={() => onDelete(skill._id)} type="button" variant="subtle">
          Delete
        </PremiumButton>
      </div>
    </GlassCard>
  );
}

export default function SkillDevelopment() {
  const { createSkill, deleteSkill, error, isCreating, isLoading, mutatingId, skills, updateSkill } = useSkills();
  const [form, setForm] = useState(initialForm);

  const tracks = useMemo(() => {
    if (skills.length > 0) return skills.map(buildTrack);
    return skillTracks.map((skill) => ({
      ...skill,
      category: skill.name,
      notes: '',
      recommendations: [],
      _id: skill.name,
    }));
  }, [skills]);

  const liveTracks = useMemo(() => (skills.length > 0 ? tracks : []), [skills.length, tracks]);
  const radarData = useMemo(() => buildRadarData(tracks), [tracks]);
  const learningSignal = useMemo(() => buildLearningSignal(liveTracks), [liveTracks]);
  const recommendations = useMemo(() => liveTracks.flatMap((skill) => skill.recommendations || []), [liveTracks]);
  const recommendationCards = useMemo(
    () => (recommendations.length > 0 ? recommendations : learningRecommendations),
    [recommendations],
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();

    try {
      await createSkill({
        category: form.category,
        learningHours: toNumber(form.learningHours),
        notes: form.notes,
        progress: clampProgress(form.progress),
        recommendations: buildRecommendations(form.recommendations),
      });
      setForm(initialForm);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleProgress(skill) {
    try {
      await updateSkill(skill._id, {
        progress: clampProgress(skill.progress + 10),
      });
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleLogHour(skill) {
    try {
      await updateSkill(skill._id, {
        learningHours: Number(skill.learningHours || 0) + 1,
      });
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleDelete(id) {
    try {
      await deleteSkill(id);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Skill Development"
        title="Build valuable skills with visible weekly momentum"
        description="Track programming, AI, sales, communication, leadership, marketing, finance, strategy, and networking from one focused learning dashboard."
        action={
          <PremiumButton disabled={isCreating} form="skill-create-form" icon={GraduationCap} type="submit">
            {isCreating ? 'Creating...' : 'Create skill sprint'}
          </PremiumButton>
        }
      />

      <GlassCard className="p-5">
        <StatusBanner className="mb-4">{error}</StatusBanner>
        <form id="skill-create-form" className="grid gap-4" onSubmit={handleCreate}>
          <div className="grid gap-3 lg:grid-cols-[0.9fr_0.6fr_0.6fr]">
            <label className="block">
              <span className="text-xs font-semibold text-steel">Category</span>
              <select
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-ink px-4 py-3 text-sm text-white"
                name="category"
                onChange={handleChange}
                value={form.category}
              >
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
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
            <label className="block">
              <span className="text-xs font-semibold text-steel">Learning hours</span>
              <input
                className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white placeholder:text-steel"
                min="0"
                name="learningHours"
                onChange={handleChange}
                placeholder="4"
                step="0.25"
                type="number"
                value={form.learningHours}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs font-semibold text-steel">Notes</span>
            <textarea
              className="focus-ring mt-2 min-h-20 w-full resize-y rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm leading-6 text-white placeholder:text-steel"
              name="notes"
              onChange={handleChange}
              placeholder="What does focused practice look like for this skill?"
              value={form.notes}
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-steel">Recommendations</span>
            <input
              className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-white placeholder:text-steel"
              name="recommendations"
              onChange={handleChange}
              placeholder="Run one mock sales call, Publish a weekly build log"
              value={form.recommendations}
            />
          </label>
          <div className="flex justify-end">
            <PremiumButton disabled={isCreating} icon={Plus} type="submit">
              {isCreating ? 'Creating...' : 'Save skill'}
            </PremiumButton>
          </div>
        </form>
      </GlassCard>

      <section className="grid gap-4 lg:grid-cols-3">
        {isLoading ? (
          <>
            <LoadingSkeleton rows={2} />
            <LoadingSkeleton rows={2} />
            <LoadingSkeleton rows={2} />
          </>
        ) : liveTracks.length > 0 ? (
          liveTracks.map((skill) => (
            <SkillCard
              busy={mutatingId === skill._id}
              key={skill._id}
              onDelete={handleDelete}
              onLogHour={handleLogHour}
              onProgress={handleProgress}
              skill={skill}
            />
          ))
        ) : (
          <div className="lg:col-span-3">
            <EmptyState title="No skill tracks yet" body="Create one track to start turning learning hours into visible momentum." action="Create skill" />
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <ChartShell title="Progress Graph" subtitle="Skill growth across the current month">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={skillProgressData}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="week" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="programming" stroke="#6EC6FF" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="ai" stroke="#F7D88A" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="sales" stroke="#FF6B4A" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="finance" stroke="#5EF1B6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Weekly Growth" subtitle="Current skill distribution">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.12)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Radar dataKey="progress" stroke="#F7D88A" fill="#F7D88A" fillOpacity={0.28} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartShell>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.74fr_1.26fr]">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[8px] bg-mint/12 text-mint">
              <TrendingUp size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold text-mint">Learning signal</p>
              <h2 className="text-xl font-bold text-white">{learningSignal.title}</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-steel">{learningSignal.body}</p>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Recommendations" title="Learning recommendations" />
          <div className="grid gap-3 sm:grid-cols-2">
            {recommendationCards.map((recommendation) => (
              <div key={recommendation} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-center gap-2 text-champagne">
                  <Sparkles size={16} />
                  <span className="text-sm font-bold">AI recommendation</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-steel">{recommendation}</p>
              </div>
            ))}
          </div>
          <PremiumButton className="mt-5" icon={BookOpen} variant="ghost">
            Open learning plan
          </PremiumButton>
        </GlassCard>
      </section>
    </div>
  );
}
