import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Calculator, Landmark, ShieldCheck } from 'lucide-react';
import ChartShell from '../components/ui/ChartShell';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import { assetAllocation, wealthModules, wealthTimeline } from '../data/mockData';

const tooltipStyle = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  background: 'rgba(8,10,19,0.95)',
  color: '#fff',
};

export default function WealthBuilding() {
  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Wealth Building"
        title="Educational systems for financial literacy and asset thinking"
        description="RiseOS AI does not promise wealth. It helps users learn budgeting, principles, investment concepts, and long-term decision discipline."
        action={<PremiumButton icon={Landmark}>Start module</PremiumButton>}
      />

      <GlassCard className="border-mint/20 bg-mint/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 text-mint" size={20} />
          <p className="text-sm leading-6 text-steel">
            Educational only: this page uses dummy data and simulation UI. It is not financial advice, investment advice, or a prediction of returns.
          </p>
        </div>
      </GlassCard>

      <section className="grid gap-4 lg:grid-cols-5">
        {wealthModules.map((module, index) => {
          const Icon = module.icon;
          return (
            <GlassCard key={module.title} className="p-4" delay={index * 0.04}>
              <div className="mb-4 grid size-11 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
                <Icon size={20} />
              </div>
              <h2 className="text-sm font-bold text-white">{module.title}</h2>
              <div className="mt-4">
                <ProgressBar value={module.progress} color="#F7D88A" label="Progress" compact />
              </div>
            </GlassCard>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.86fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Wealth Journey Timeline" title="Long-term behavior path" />
          <div className="relative space-y-4">
            <div className="absolute left-4 top-4 h-[calc(100%-2rem)] w-px bg-white/10" />
            {wealthTimeline.map((item) => (
              <div key={item.year} className="relative flex gap-4">
                <div className="z-10 grid size-8 shrink-0 place-items-center rounded-full bg-gold-line text-xs font-black text-night">{item.year.slice(2)}</div>
                <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-sm font-bold text-white">{item.year} · {item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-steel">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <ChartShell title="Asset Allocation Charts" subtitle="Educational sample allocation">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={assetAllocation} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                {assetAllocation.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartShell>
      </section>

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Compound Growth Simulator UI" title="Scenario planner" description="Adjust assumptions later when backend formulas are connected." />
        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['Monthly contribution', '$250'],
            ['Learning return', 'Skill income'],
            ['Time horizon', '10 years'],
            ['Discipline factor', 'High'],
          ].map(([label, value]) => (
            <label key={label} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-steel">{label}</span>
              <input className="focus-ring mt-3 w-full bg-transparent text-lg font-black text-white" defaultValue={value} />
            </label>
          ))}
        </div>
        <PremiumButton className="mt-5" icon={Calculator} variant="ghost">
          Simulate plan
        </PremiumButton>
      </GlassCard>
    </div>
  );
}
