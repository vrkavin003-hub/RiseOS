import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Github, Mail } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import PremiumButton from '../../components/ui/PremiumButton';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../lib/api';

export default function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { checked, name, type, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <PremiumButton variant="ghost" icon={Github} type="button" disabled>
          GitHub
        </PremiumButton>
        <PremiumButton variant="ghost" icon={Mail} type="button" disabled>
          Google
        </PremiumButton>
      </div>
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-steel">
        <span className="h-px flex-1 bg-white/10" />
        or
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-[8px] border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember" role="alert">
            {error}
          </div>
        )}
        <label className="block">
          <span className="text-xs font-semibold text-steel">Email</span>
          <input
            autoComplete="email"
            className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel"
            name="email"
            onChange={handleChange}
            placeholder="kavin@riseos.ai"
            required
            type="email"
            value={form.email}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-steel">Password</span>
          <input
            autoComplete="current-password"
            className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel"
            name="password"
            onChange={handleChange}
            placeholder="Password"
            required
            type="password"
            value={form.password}
          />
        </label>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-steel">
            <input
              checked={form.rememberMe}
              className="accent-champagne"
              name="rememberMe"
              onChange={handleChange}
              type="checkbox"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-champagne hover:text-white">
            Forgot password?
          </Link>
        </div>
        <PremiumButton className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in...' : 'Login'}
        </PremiumButton>
      </form>
    </AuthLayout>
  );
}
