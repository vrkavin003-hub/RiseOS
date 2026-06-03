import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, Building2, Lightbulb, Search, Sparkles } from 'lucide-react';
import ChartShell from '../components/ui/ChartShell';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import { businessLab } from '../data/mockData';

const tooltipStyle = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  background: 'rgba(8,10,19,0.95)',
  color: '#fff',
};

export default function BusinessLab() {
  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Business Idea Lab"
        title="Generate, pressure-test, and shape startup opportunities"
        description="A premium business dashboard for idea generation, startup building, revenue model design, SWOT analysis, market opportunity, and competitor mapping."
        action={<PremiumButton icon={Lightbulb}>Generate idea</PremiumButton>}
      />

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard className="luxury-border p-5">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[8px] bg-gold-line text-night">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-champagne">Business Idea Generator</p>
              <h2 className="text-2xl font-black text-white">High-signal startup concept</h2>
            </div>
          </div>
          <p className="mt-5 rounded-[8px] border border-champagne/20 bg-champagne/10 p-5 text-lg font-semibold leading-8 text-white">
            {businessLab.generatedIdea}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {['Validate pain', 'Estimate pricing', 'Find first 10 users'].map((action) => (
              <button key={action} className="focus-ring rounded-[8px] border border-white/10 bg-white/[0.045] p-3 text-left text-sm font-bold text-white transition hover:border-champagne/35">
                {action}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Startup Builder" title="Operating assumptions" />
          <div className="space-y-3">
            {businessLab.startupBuilder.map((item) => (
              <div key={item.label} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-champagne">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Revenue Model Canvas" title="Revenue streams" />
          <div className="space-y-4">
            {businessLab.revenueModel.map((stream) => (
              <div key={stream.stream}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{stream.stream}</p>
                    <p className="text-xs text-steel">Potential: {stream.potential}</p>
                  </div>
                  <span className="text-sm font-bold text-champagne">{stream.confidence}%</span>
                </div>
                <ProgressBar value={stream.confidence} color={stream.confidence > 70 ? '#F7D88A' : '#6EC6FF'} compact />
              </div>
            ))}
          </div>
        </GlassCard>

        <ChartShell title="Market Opportunity Analyzer" subtitle="Confidence score by model component">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={businessLab.revenueModel}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="stream" stroke="#94A3B8" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="confidence" fill="#F7D88A" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="SWOT Analysis" title="Strategic pressure test" />
          <div className="grid gap-3 sm:grid-cols-2">
            {businessLab.swot.map((item) => (
              <div key={item.title} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-steel">{item.body}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Competitor Analysis" title="Market map" />
          <div className="space-y-3">
            {businessLab.competitors.map((competitor) => (
              <div key={competitor} className="flex items-center justify-between rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-azure" />
                  <span className="text-sm font-semibold text-white">{competitor}</span>
                </div>
                <ArrowUpRight size={16} className="text-steel" />
              </div>
            ))}
          </div>
          <PremiumButton className="mt-5 w-full" icon={Search} variant="ghost">
            Analyze competitors
          </PremiumButton>
        </GlassCard>
      </section>
    </div>
  );
}
