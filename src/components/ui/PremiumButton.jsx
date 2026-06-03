export default function PremiumButton({ children, icon: Icon, variant = 'gold', className = '', ...props }) {
  const variants = {
    gold: 'bg-gold-line text-night shadow-gold hover:brightness-110',
    ghost: 'border border-white/10 bg-white/8 text-white hover:border-champagne/35 hover:bg-white/12',
    subtle: 'bg-white/6 text-steel hover:bg-white/10 hover:text-white',
  };

  return (
    <button
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-bold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}
