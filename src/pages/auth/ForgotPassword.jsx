import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import PremiumButton from '../../components/ui/PremiumButton';

export default function ForgotPassword() {
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
      <form className="space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-steel">Account email</span>
          <input className="focus-ring mt-2 w-full rounded-[8px] border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder:text-steel" placeholder="kavin@riseos.ai" />
        </label>
        <PremiumButton className="w-full" icon={MailCheck} type="button">
          Send reset link
        </PremiumButton>
      </form>
    </AuthLayout>
  );
}
