import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Github, Mail, Sparkles } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import PremiumButton from '../../components/ui/PremiumButton';
import StatusBanner from '../../components/ui/StatusBanner';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../lib/api';

const ambitions = [
  'Build an AI product business',
  'Grow career and income',
  'Improve discipline and health',
  'Master valuable skills',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    primaryAmbition: ambitions[0],
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <PremiumButton variant="ghost" icon={Github} type="button" disabled>
          GitHub
        </PremiumButton>
        <PremiumButton variant="ghost" icon={Mail} type="button" disabled>
          Google
        </PremiumButton>
      </div>
      <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
        <StatusBanner>{error}</StatusBanner>
        <label className="block">
          <span className="text-xs font-semibold text-steel">Full name</span>
          <input
            autoComplete="name"
            className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel"
            minLength={2}
            name="name"
            onChange={handleChange}
            placeholder="Kavin"
            required
            value={form.name}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-steel">Primary ambition</span>
          <select
            className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-ink px-4 py-3 text-white"
            name="primaryAmbition"
            onChange={handleChange}
            value={form.primaryAmbition}
          >
            {ambitions.map((ambition) => (
              <option key={ambition}>{ambition}</option>
            ))}
          </select>
        </label>
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
            autoComplete="new-password"
            className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel"
            minLength={8}
            name="password"
            onChange={handleChange}
            placeholder="Create a strong password"
            required
            type="password"
            value={form.password}
          />
        </label>
        <PremiumButton className="w-full" disabled={isSubmitting} icon={Sparkles} type="submit">
          {isSubmitting ? 'Creating account...' : 'Start onboarding'}
        </PremiumButton>
      </form>
    </AuthLayout>
  );
}
