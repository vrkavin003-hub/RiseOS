import { Link } from 'react-router-dom';
import { Github, Mail } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import PremiumButton from '../../components/ui/PremiumButton';

export default function Login() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your daily operating review, AI coaching, and decision intelligence."
      footer={
        <>
          New to RiseOS AI?{' '}
          <Link className="font-bold text-champagne hover:text-white" to="/register">
            Create account
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
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-steel">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <form className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-steel">Email</span>
          <input className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel" placeholder="kavin@riseos.ai" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-steel">Password</span>
          <input type="password" className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel" placeholder="••••••••" />
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-steel">
            <input type="checkbox" className="accent-champagne" defaultChecked />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-champagne hover:text-white">
            Forgot password?
          </Link>
        </div>
        <PremiumButton className="w-full" type="button">
          Login
        </PremiumButton>
      </form>
    </AuthLayout>
  );
}
