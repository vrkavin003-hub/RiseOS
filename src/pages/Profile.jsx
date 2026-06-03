import { CalendarDays, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import StatPill from '../components/ui/StatPill';
import { achievementBadges, activityHistory, profileStats, user } from '../data/mockData';

export default function Profile() {
  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Profile"
        title="Personal operating profile"
        description="User information, growth statistics, achievement badges, activity history, and personal settings readiness."
      />

      <section className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <GlassCard className="p-5">
          <div className="flex flex-col items-center text-center">
            <div className="grid size-24 place-items-center rounded-[8px] bg-gold-line text-4xl font-black text-night shadow-gold">{user.avatar}</div>
            <h2 className="mt-5 text-2xl font-black text-white">{user.name}</h2>
            <p className="mt-1 text-sm font-semibold text-champagne">{user.level}</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-steel">{user.focus}</p>
          </div>
          <div className="mt-6 space-y-3">
            <StatPill label="Role" value={user.role} icon={UserRound} />
            <StatPill label="Location" value={user.location} icon={MapPin} tone="text-mint" />
            <StatPill label="Current streak" value={`${user.streak} days`} icon={CalendarDays} tone="text-azure" />
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <SectionHeader eyebrow="Growth Statistics" title="Operating metrics" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {profileStats.map((stat) => (
                <div key={stat.label} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs font-semibold text-steel">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader eyebrow="Achievement Badges" title="Proof of progress" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {achievementBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.title} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                    <div className="mb-3 grid size-11 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
                      <Icon size={20} />
                    </div>
                    <p className="text-sm font-bold text-white">{badge.title}</p>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Activity History" title="Recent actions" />
          <div className="space-y-3">
            {activityHistory.map((activity, index) => (
              <div key={activity} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-champagne/12 text-xs font-black text-champagne">{index + 1}</div>
                <p className="text-sm font-semibold text-white">{activity}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Personal Settings" title="Profile readiness" />
          <div className="space-y-5">
            <ProgressBar label="AI personalization" value={86} color="#F7D88A" />
            <ProgressBar label="Data completeness" value={72} color="#6EC6FF" />
            <ProgressBar label="Security posture" value={94} color="#5EF1B6" />
          </div>
          <div className="mt-5 rounded-[8px] border border-mint/20 bg-mint/10 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-mint">
              <ShieldCheck size={16} />
              Privacy-first profile
            </div>
            <p className="mt-2 text-sm leading-6 text-steel">Ready for backend identity, encrypted journals, and AI preference syncing.</p>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
