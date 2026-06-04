const toneClasses = {
  error: 'border-ember/30 bg-ember/10 text-ember',
  info: 'border-azure/30 bg-azure/10 text-azure',
  success: 'border-mint/30 bg-mint/10 text-mint',
  warning: 'border-champagne/30 bg-champagne/10 text-champagne',
};

const sizeClasses = {
  md: 'px-4 py-3 text-sm',
  sm: 'px-3 py-2 text-xs',
};

export default function StatusBanner({ children, className = '', role, size = 'md', tone = 'error' }) {
  if (!children) return null;

  const statusRole = role || (tone === 'error' ? 'alert' : 'status');
  const toneClass = toneClasses[tone] || toneClasses.error;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`rounded-[8px] border font-semibold ${toneClass} ${sizeClass} ${className}`} role={statusRole}>
      {children}
    </div>
  );
}
