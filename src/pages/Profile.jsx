import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Camera, CheckCircle2, Loader2, MapPin, Save, ShieldCheck, UserRound } from 'lucide-react';
import AppLogo from '../components/ui/AppLogo';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import StatPill from '../components/ui/StatPill';
import { useAuth } from '../context/AuthContext';
import { useAccountProfile } from '../hooks/useAccountProfile';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { getApiErrorMessage } from '../lib/api';

const inputClass =
  'focus-ring w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-steel/60 focus:border-champagne/45';
const textareaClass = `${inputClass} min-h-28 resize-y leading-6`;

function buildForm(user) {
  return {
    bio: user?.bio || '',
    goalsText: Array.isArray(user?.goals) ? user.goals.join('\n') : '',
    location: user?.location || '',
    name: user?.name || '',
    profession: user?.profession || '',
  };
}

function parseLines(value) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function formatDate(value) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

export default function Profile() {
  const { user } = useAuth();
  const { dashboard } = useDashboardSummary();
  const { saveProfile, uploadProfilePhoto } = useAccountProfile();
  const [form, setForm] = useState(() => buildForm(user));
  const [feedback, setFeedback] = useState({ message: '', tone: 'success' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setForm(buildForm(user));
  }, [user]);

  const stats = useMemo(
    () => [
      { label: 'Growth Score', value: `${dashboard?.growthScore ?? 0}/100` },
      { label: 'Completed Goals', value: dashboard?.goalsCompleted ?? 0 },
      { label: 'Learning Hours', value: Number(dashboard?.learningHours ?? 0).toFixed(1) },
      { label: 'Journal Entries', value: dashboard?.journalEntries ?? 0 },
    ],
    [dashboard],
  );

  const readiness = useMemo(() => {
    const profileFields = [user?.name, user?.bio, user?.profession, user?.location, user?.goals?.length];
    const profileComplete = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
    const aiFields = [user?.aiPreferences?.coachingStyle, user?.aiPreferences?.focusAreas?.length, user?.goals?.length];
    const aiPersonalization = Math.round((aiFields.filter(Boolean).length / aiFields.length) * 100);

    return {
      aiPersonalization,
      dataCompleteness: profileComplete,
      security: user?.emailVerified ? 100 : 70,
    };
  }, [user]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback({ message: '', tone: 'success' });
    setIsSaving(true);

    try {
      await saveProfile({
        bio: form.bio,
        goals: parseLines(form.goalsText),
        location: form.location,
        name: form.name,
        profession: form.profession,
      });
      setFeedback({ message: 'Profile saved to your RiseOS account.', tone: 'success' });
    } catch (error) {
      setFeedback({ message: getApiErrorMessage(error), tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePhotoChange(event) {
    const [file] = event.target.files || [];
    if (!file) return;

    setFeedback({ message: '', tone: 'success' });
    setIsUploading(true);

    try {
      await uploadProfilePhoto(file);
      setFeedback({ message: 'Profile photo updated.', tone: 'success' });
    } catch (error) {
      setFeedback({ message: getApiErrorMessage(error), tone: 'error' });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Profile"
        title="Personal operating profile"
        description="Keep your identity, goals, and AI context current so RiseOS can personalize coaching from real account data."
      />

      <section className="grid gap-4 xl:grid-cols-[0.78fr_1.22fr]">
        <GlassCard className="p-5">
          <div className="flex flex-col items-center text-center">
            {user?.profilePhoto ? (
              <img alt="" className="size-24 rounded-full border border-champagne/25 object-cover shadow-gold" src={user.profilePhoto} />
            ) : (
              <AppLogo className="size-24" imageClassName="p-2" />
            )}
            <h2 className="mt-5 text-2xl font-black text-white">{user?.name || 'RiseOS user'}</h2>
            <p className="mt-1 text-sm font-semibold text-champagne">{user?.profession || 'Builder in progress'}</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-steel">{user?.bio || 'Add a short bio to sharpen your AI coaching context.'}</p>
            <input className="sr-only" id="profile-photo" type="file" accept="image/*" onChange={handlePhotoChange} />
            <label
              className="focus-ring mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/8 px-4 text-sm font-bold text-white transition hover:border-champagne/35 hover:bg-white/12"
              htmlFor="profile-photo"
            >
              {isUploading ? <Loader2 className="animate-spin" size={17} /> : <Camera size={17} />}
              {isUploading ? 'Uploading' : 'Update photo'}
            </label>
          </div>

          <div className="mt-6 space-y-3">
            <StatPill label="Email" value={user?.email || 'Not set'} icon={UserRound} />
            <StatPill label="Location" value={user?.location || 'Add location'} icon={MapPin} tone="text-mint" />
            <StatPill label="Joined" value={formatDate(user?.createdAt)} icon={CalendarDays} tone="text-azure" />
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <SectionHeader eyebrow="Growth Statistics" title="Operating metrics" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                  <p className="text-xs font-semibold text-steel">{stat.label}</p>
                  <p className="mt-2 text-2xl font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader eyebrow="Edit Profile" title="Account details" />
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Name">
                  <input className={inputClass} value={form.name} onChange={(event) => updateField('name', event.target.value)} />
                </Field>
                <Field label="Profession">
                  <input
                    className={inputClass}
                    placeholder="Founder, engineer, student..."
                    value={form.profession}
                    onChange={(event) => updateField('profession', event.target.value)}
                  />
                </Field>
              </div>

              <Field label="Location">
                <input className={inputClass} placeholder="City, country" value={form.location} onChange={(event) => updateField('location', event.target.value)} />
              </Field>

              <Field label="Bio">
                <textarea className={textareaClass} value={form.bio} onChange={(event) => updateField('bio', event.target.value)} />
              </Field>

              <Field label="Primary goals">
                <textarea
                  className={textareaClass}
                  placeholder="One goal per line"
                  value={form.goalsText}
                  onChange={(event) => updateField('goalsText', event.target.value)}
                />
              </Field>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {feedback.message && (
                  <p className={`text-sm font-semibold ${feedback.tone === 'error' ? 'text-ember' : 'text-mint'}`}>{feedback.message}</p>
                )}
                <PremiumButton className="sm:ml-auto" disabled={isSaving} icon={isSaving ? Loader2 : Save} type="submit">
                  {isSaving ? 'Saving' : 'Save profile'}
                </PremiumButton>
              </div>
            </form>
          </GlassCard>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="AI Context" title="Goals used for coaching" />
          <div className="grid gap-3 md:grid-cols-2">
            {(user?.goals?.length ? user.goals : ['Add goals above to personalize your daily plan.']).map((goal, index) => (
              <div key={`${goal}-${index}`} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-champagne/12 text-xs font-black text-champagne">{index + 1}</div>
                <p className="text-sm font-semibold text-white">{goal}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Personal Settings" title="Profile readiness" />
          <div className="space-y-5">
            <ProgressBar label="AI personalization" value={readiness.aiPersonalization} color="#F7D88A" />
            <ProgressBar label="Data completeness" value={readiness.dataCompleteness} color="#6EC6FF" />
            <ProgressBar label="Security posture" value={readiness.security} color="#5EF1B6" />
          </div>
          <div className="mt-5 rounded-[8px] border border-mint/20 bg-mint/10 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-mint">
              {user?.emailVerified ? <CheckCircle2 size={16} /> : <ShieldCheck size={16} />}
              {user?.emailVerified ? 'Verified account' : 'Email verification pending'}
            </div>
            <p className="mt-2 text-sm leading-6 text-steel">Profile, preferences, privacy, and notification settings now sync with MongoDB.</p>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

function Field({ children, label }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-steel">{label}</span>
      {children}
    </label>
  );
}
