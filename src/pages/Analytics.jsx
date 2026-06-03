import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, BarChart3, Clock, TrendingUp } from 'lucide-react';
import ChartShell from '../components/ui/ChartShell';
import GlassCard from '../components/ui/GlassCard';
import SectionHeader from '../components/ui/SectionHeader';
import StatPill from '../components/ui/StatPill';
import { analyticsData } from '../data/mockData';

const tooltipStyle = {
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  background: 'rgba(8,10,19,0.95)',
  color: '#fff',
};

export default function Analytics() {
  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Analytics"
        title="Decision dashboard for growth, consistency, skill, and productivity"
        description="Beautiful dummy-data charts designed for immediate backend integration."
      />

      <section className="grid gap-3 md:grid-cols-4">
        <StatPill label="Growth Score" value="88" icon={TrendingUp} />
        <StatPill label="Habit Consistency" value="91%" icon={Activity} tone="text-mint" />
        <StatPill label="Learning Hours" value="54h" icon={Clock} tone="text-azure" />
        <StatPill label="Productivity" value="86%" icon={BarChart3} tone="text-orchid" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartShell title="Growth Score" subtitle="Month-over-month operating score">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData}>
              <defs>
                <linearGradient id="analyticsGrowth" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#F7D88A" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#F7D88A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="growth" stroke="#F7D88A" strokeWidth={3} fill="url(#analyticsGrowth)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Habit Consistency" subtitle="Discipline score by month">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="habits" stroke="#5EF1B6" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="productivity" stroke="#6EC6FF" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Income Growth" subtitle="Educational dummy data for income tracking">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="income" fill="#B38CFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartShell>

        <ChartShell title="Skill Development" subtitle="Learning hours and skill score">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData}>
              <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="learning" stroke="#F7D88A" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="skills" stroke="#FF6B4A" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartShell>
      </section>

      <GlassCard className="p-5">
        <SectionHeader eyebrow="Productivity" title="Current month operating summary" />
        <div className="grid gap-3 md:grid-cols-3">
          {['Deep work is rising faster than learning hours.', 'Income trend correlates with consistent shipping.', 'Skill growth needs more sales and networking reps.'].map((insight) => (
            <div key={insight} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4 text-sm leading-6 text-steel">
              {insight}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
