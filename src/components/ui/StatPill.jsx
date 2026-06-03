export default function StatPill({ label, value, icon: Icon, tone = 'text-champagne' }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 py-2">
      {Icon && (
        <div className={`grid size-9 place-items-center rounded-[8px] bg-white/8 ${tone}`}>
          <Icon size={17} />
        </div>
      )}
      <div>
        <p className="text-xs text-steel">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
