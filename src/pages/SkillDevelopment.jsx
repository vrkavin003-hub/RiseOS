import {
  CartesianGrid,
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BookOpen, GraduationCap, Sparkles, TrendingUp } from 'lucide-react';
import ChartShell from '../components/ui/ChartShell';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import { learningRecommendations, skillProgressData, skillTracks } from '../data/mockData';

const tooltipStyle = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  background: 'rgba(8,10,19,0.95)',
  color: '#fff',
};

const radarData = skillTracks.map((skill) => ({
  skill: skill.name.replace('Business Strategy', 'Strategy'),
  progress: skill.progress,
}));

export default function SkillDevelopment() {
  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Skill Development"
        title="Build valuable skills with visible weekly momentum"
        description="Track programming, AI, sales, communication, leadership, marketing, finance, strategy, and networking from one focused learning dashboard."
        action={<PremiumButton icon={GraduationCap}>Create skill sprint</PremiumButton>}
      />

      <section className="grid gap-4 lg:grid-cols-3">
        {skillTracks.map((skill, index) => (
          <GlassCard key={skill.name} className="p-4 transition hover:-translate-y-1 hover:border-champagne/30" delay={index * 0.03}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white">{skill.name}</h2>
                <p className="mt-1 text-xs font-semibold text-steel">{skill.level}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-bold text-mint">{skill.weeklyGrowth}</span>
            </div>
            <ProgressBar label="Skill Level" value={skill.progress} color={skill.color} />
          </GlassCard>
        ))}
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
              <h2 className="text-xl font-bold text-white">Sales and networking need deliberate practice</h2>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-steel">
            Your strongest builder skills are technical. The highest ROI improvement is pairing product output with distribution practice.
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Recommendations" title="Learning recommendations" />
          <div className="grid gap-3 sm:grid-cols-2">
            {learningRecommendations.map((recommendation) => (
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
