import { CalendarClock, CheckCircle2, Target, Trophy } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import { achievementTimeline, goals } from '../data/mockData';

const colors = {
  Career: '#6EC6FF',
  Business: '#F7D88A',
  Health: '#5EF1B6',
  Learning: '#B38CFF',
  Financial: '#FF6B4A',
};

export default function Goals() {
  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Goals"
        title="Milestones, predictions, and achievement momentum"
        description="Track career, business, health, learning, and financial goals with progress, milestone visibility, completion predictions, and a timeline of wins."
        action={<PremiumButton icon={Target}>Create goal</PremiumButton>}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {goals.map((goal, index) => (
          <GlassCard key={goal.title} className="p-5 transition hover:-translate-y-1 hover:border-champagne/30" delay={index * 0.04}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-bold text-steel">{goal.type}</span>
                <h2 className="mt-3 text-xl font-black text-white">{goal.title}</h2>
              </div>
              <div className="flex items-center gap-2 rounded-[8px] border border-champagne/20 bg-champagne/10 px-3 py-2 text-sm font-bold text-champagne">
                <CalendarClock size={16} />
                {goal.prediction}
              </div>
            </div>
            <ProgressBar label="Goal progress" value={goal.progress} color={colors[goal.type]} />
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              {goal.milestones.map((milestone, milestoneIndex) => (
                <div
                  key={milestone}
                  className={`rounded-[8px] border p-3 text-sm font-semibold ${
                    milestoneIndex === 0 ? 'border-mint/25 bg-mint/10 text-mint' : 'border-white/10 bg-white/[0.045] text-steel'
                  }`}
                >
                  {milestone}
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </section>

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Achievement Timeline" title="Recent proof of progress" />
        <div className="grid gap-3 md:grid-cols-4">
          {achievementTimeline.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.event} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="grid size-10 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
                    <Icon size={18} />
                  </div>
                  <span className="text-xs font-semibold text-steel">{item.date}</span>
                </div>
                <p className="text-sm font-bold leading-5 text-white">{item.event}</p>
              </div>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[8px] bg-gold-line text-night">
              <Trophy size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-champagne">Completion prediction</p>
              <h2 className="text-xl font-black text-white">Three goals are on track this month</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-mint">
            <CheckCircle2 size={18} />
            82% milestone quality
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
