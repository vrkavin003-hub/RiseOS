import { useState } from 'react';
import { Bell, Brain, Download, Moon, Save, ShieldCheck } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import SectionHeader from '../components/ui/SectionHeader';
import { settingsGroups } from '../data/mockData';

export default function Settings() {
  const [settings, setSettings] = useState(
    settingsGroups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({ ...item })),
    })),
  );

  function toggle(groupTitle, label) {
    setSettings((current) =>
      current.map((group) =>
        group.title === groupTitle
          ? {
              ...group,
              items: group.items.map((item) => (item.label === label ? { ...item, enabled: !item.enabled } : item)),
            }
          : group,
      ),
    );
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Settings"
        title="Control privacy, AI behavior, notifications, and data portability"
        description="Production-ready settings surfaces prepared for backend integration."
        action={<PremiumButton icon={Save}>Save changes</PremiumButton>}
      />

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Mode" title="Interface preferences" />
          <div className="rounded-[8px] border border-champagne/20 bg-champagne/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-[8px] bg-gold-line text-night">
                <Moon size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Dark mode</h2>
                <p className="mt-1 text-sm text-steel">Premium dark mode is enabled by default.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            <Preference icon={Bell} title="Notification digest" body="Daily executive brief at 7 AM." />
            <Preference icon={Brain} title="AI tone" body="Direct, strategic, and encouraging." />
            <Preference icon={Download} title="Data export" body="CSV and JSON export hooks ready." />
          </div>
        </GlassCard>

        <div className="space-y-4">
          {settings.map((group) => (
            <GlassCard key={group.title} className="p-5">
              <SectionHeader eyebrow={group.title} title={`${group.title} controls`} />
              <div className="space-y-3">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="focus-ring flex w-full items-center justify-between gap-4 rounded-[8px] border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-champagne/30"
                      onClick={() => toggle(group.title, item.label)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-[8px] bg-white/8 text-champagne">
                          <Icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{item.label}</p>
                          <p className="mt-1 text-xs text-steel">{item.enabled ? 'Enabled' : 'Disabled'}</p>
                        </div>
                      </div>
                      <span
                        className={`relative h-7 w-12 rounded-full border transition ${
                          item.enabled ? 'border-champagne/40 bg-champagne/30' : 'border-white/10 bg-white/[0.05]'
                        }`}
                      >
                        <span
                          className={`absolute top-1 size-5 rounded-full bg-white transition ${item.enabled ? 'left-6' : 'left-1'}`}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <GlassCard className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[8px] bg-mint/12 text-mint">
              <ShieldCheck size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold text-mint">Privacy and security</p>
              <h2 className="text-xl font-black text-white">Ready for encrypted user data and consent controls</h2>
            </div>
          </div>
          <PremiumButton variant="ghost">Review privacy</PremiumButton>
        </div>
      </GlassCard>
    </div>
  );
}

function Preference({ icon: Icon, title, body }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-champagne" />
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="mt-1 text-xs text-steel">{body}</p>
        </div>
      </div>
    </div>
  );
}
