import { Link } from 'react-router-dom';
import { Github, Mail, Sparkles } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import PremiumButton from '../../components/ui/PremiumButton';

export default function Register() {
  return (
    <AuthLayout
      title="Create your command center"
      subtitle="Start with a premium onboarding profile that helps AI personalize goals, habits, learning, and business insights."
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-bold text-champagne hover:text-white" to="/login">
            Sign in
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <PremiumButton variant="ghost" icon={Github}>
          GitHub
        </PremiumButton>
        <PremiumButton variant="ghost" icon={Mail}>
          Google
        </PremiumButton>
      </div>
      <form className="mt-5 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-steel">Full name</span>
          <input className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel" placeholder="Kavin" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-steel">Primary ambition</span>
          <select className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-ink px-4 py-3 text-white">
            <option>Build an AI product business</option>
            <option>Grow career and income</option>
            <option>Improve discipline and health</option>
            <option>Master valuable skills</option>
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-steel">Email</span>
          <input className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel" placeholder="kavin@riseos.ai" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-steel">Password</span>
          <input type="password" className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel" placeholder="Create a strong password" />
        </label>
        <PremiumButton className="w-full" icon={Sparkles} type="button">
          Start onboarding
        </PremiumButton>
      </form>
    </AuthLayout>
  );
}
