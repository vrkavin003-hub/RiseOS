import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { authBenefits, onboardingScreens } from '../../data/mockData';
import AppLogo from '../ui/AppLogo';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <main className="grid min-h-screen bg-night lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative flex min-h-screen items-center overflow-hidden px-5 py-10 sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(247,216,138,0.22),transparent_28rem),radial-gradient(circle_at_70%_76%,rgba(94,241,182,0.12),transparent_22rem)]" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto w-full max-w-md"
        >
          <Link to="/" className="mb-8 inline-flex items-center gap-3">
            <AppLogo className="size-11" />
            <div>
              <p className="text-base font-black text-white">RiseOS AI</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-champagne/75">Life Operating System</p>
            </div>
          </Link>
          <div className="glass-panel luxury-border rounded-[8px] p-5 sm:p-7">
            <div className="mb-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-champagne/25 bg-champagne/10 px-3 py-1 text-xs font-bold text-champagne">
                <Sparkles size={14} /> Premium AI operating layer
              </p>
              <h1 className="mt-5 text-3xl font-black text-white">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-steel">{subtitle}</p>
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-sm text-steel">{footer}</div>}
          </div>
        </motion.div>
      </section>
      <section className="hidden border-l border-white/10 bg-obsidian/80 p-10 lg:block">
        <div className="flex h-full flex-col justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-champagne/75">Onboarding</p>
            <h2 className="mt-4 max-w-lg text-4xl font-black leading-tight text-white">A premium cockpit for sharper personal and business decisions.</h2>
          </div>
          <div className="space-y-4">
            {onboardingScreens.map((screen, index) => (
              <motion.div
                key={screen.title}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.12 * index }}
                className="rounded-[8px] border border-white/10 bg-white/[0.055] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{screen.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-steel">{screen.body}</p>
                  </div>
                  <ArrowRight className="mt-1 text-champagne" size={19} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {screen.chips.map((chip) => (
                    <span key={chip} className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-steel">
                      {chip}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {authBenefits.map((benefit) => (
              <div key={benefit} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3 text-sm font-semibold text-white">
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
