export default function ProgressBar({ value, color = '#F7D88A', label, compact = false }) {
  return (
    <div>
      {label && (
        <div className="mb-2 flex items-center justify-between text-xs text-steel">
          <span>{label}</span>
          <span className="font-semibold text-white">{value}%</span>
        </div>
      )}
      <div className={`overflow-hidden rounded-full bg-white/8 ${compact ? 'h-1.5' : 'h-2.5'}`}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${Math.min(value, 100)}%`,
            background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.82))`,
            boxShadow: `0 0 20px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}
