import GlassCard from './GlassCard';

export default function ChartShell({ title, subtitle, children, className = '' }) {
  return (
    <GlassCard className={`p-4 ${className}`}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-steel">{subtitle}</p>}
      </div>
      <div className="h-64 min-h-64">{children}</div>
    </GlassCard>
  );
}
