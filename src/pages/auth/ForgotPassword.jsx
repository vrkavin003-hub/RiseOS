import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import PremiumButton from '../../components/ui/PremiumButton';
import { authApi, getApiErrorMessage } from '../../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await authApi.forgotPassword({ email });
      setMessage(response.message);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Reset access"
      subtitle="Enter your account email and RiseOS AI will send a secure recovery link."
      footer={
        <Link className="inline-flex items-center gap-2 font-bold text-champagne hover:text-white" to="/login">
          <ArrowLeft size={15} />
          Back to login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-[8px] border border-ember/30 bg-ember/10 px-4 py-3 text-sm font-semibold text-ember" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-[8px] border border-mint/30 bg-mint/10 px-4 py-3 text-sm font-semibold text-mint" role="status">
            {message}
          </div>
        )}
        <label className="block">
          <span className="text-xs font-semibold text-steel">Account email</span>
          <input
            autoComplete="email"
            className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="kavin@riseos.ai"
            required
            type="email"
            value={email}
          />
        </label>
        <PremiumButton className="w-full" disabled={isSubmitting} icon={MailCheck} type="submit">
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </PremiumButton>
      </form>
    </AuthLayout>
  );
}
