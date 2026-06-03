import GlassCard from './GlassCard';
import ProgressBar from './ProgressBar';

export default function MetricCard({ label, value, delta, icon: Icon, color, delay = 0 }) {
  return (
    <GlassCard className="group p-4 transition duration-300 hover:-translate-y-1 hover:border-champagne/35 hover:shadow-gold" delay={delay}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-steel">{label}</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{value}</span>
            <span className="pb-1 text-xs font-semibold text-mint">{delta}</span>
          </div>
        </div>
        <div
          className="grid size-10 place-items-center rounded-[8px] border border-white/10 bg-white/8 transition group-hover:scale-105"
          style={{ color }}
        >
          <Icon size={20} />
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={value} color={color} compact />
      </div>
    </GlassCard>
  );
}
