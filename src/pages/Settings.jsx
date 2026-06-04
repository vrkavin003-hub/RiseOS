import { useEffect, useMemo, useState } from 'react';
import { Bell, Brain, Check, KeyRound, Loader2, LogOut, Mail, Moon, Save, ShieldCheck } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import PremiumButton from '../components/ui/PremiumButton';
import SectionHeader from '../components/ui/SectionHeader';
import { useAuth } from '../context/AuthContext';
import { useAccountProfile } from '../hooks/useAccountProfile';
import { getApiErrorMessage } from '../lib/api';

const inputClass =
  'focus-ring w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-steel/60 focus:border-champagne/45';
const selectClass = `${inputClass} appearance-none`;

const notificationLabels = {
  aiAdvice: 'AI recommendations',
  friendRequests: 'Friend request alerts',
  goals: 'Goal reminders',
  habits: 'Habit reminders',
  journal: 'Journal prompts',
  news: 'News updates',
};

const focusAreaOptions = [
  'Career growth',
  'Skill development',
  'Business thinking',
  'Productivity',
  'Discipline',
  'Goal achievement',
  'Financial literacy',
  'Daily learning',
  'News awareness',
];

const coachingStyles = [
  { label: 'Direct', value: 'direct' },
  { label: 'Supportive', value: 'supportive' },
  { label: 'Strategic', value: 'strategic' },
  { label: 'Analytical', value: 'analytical' },
];

const visibilityOptions = [
  { label: 'Public', value: 'public' },
  { label: 'Friends', value: 'friends' },
  { label: 'Private', value: 'private' },
];

function buildSettings(user) {
  return {
    aiPreferences: {
      coachingStyle: user?.aiPreferences?.coachingStyle || 'direct',
      focusAreas: Array.isArray(user?.aiPreferences?.focusAreas) ? user.aiPreferences.focusAreas : [],
    },
    notificationSettings: {
      aiAdvice: true,
      friendRequests: true,
      goals: true,
      habits: true,
      journal: true,
      news: true,
      ...(user?.notificationSettings || {}),
    },
    privacySettings: {
      profileVisibility: user?.privacySettings?.profileVisibility || 'private',
      statusVisibility: user?.privacySettings?.statusVisibility || 'friends',
    },
    themePreference: user?.themePreference || 'dark',
  };
}

export default function Settings() {
  const { logoutEverywhere, user } = useAuth();
  const { changeEmail, changePassword, saveSettings } = useAccountProfile();
  const [settings, setSettings] = useState(() => buildSettings(user));
  const [emailForm, setEmailForm] = useState({ email: user?.email || '', password: '' });
  const [passwordForm, setPasswordForm] = useState({ confirmPassword: '', currentPassword: '', password: '' });
  const [messages, setMessages] = useState({ email: '', password: '', settings: '' });
  const [errors, setErrors] = useState({ email: '', password: '', settings: '' });
  const [pendingAction, setPendingAction] = useState('');

  useEffect(() => {
    setSettings(buildSettings(user));
    setEmailForm((current) => ({ ...current, email: user?.email || '' }));
  }, [user]);

  const selectedFocusAreas = useMemo(() => new Set(settings.aiPreferences.focusAreas), [settings.aiPreferences.focusAreas]);

  function setMessage(section, message, isError = false) {
    if (isError) {
      setErrors((current) => ({ ...current, [section]: message }));
      setMessages((current) => ({ ...current, [section]: '' }));
      return;
    }

    setMessages((current) => ({ ...current, [section]: message }));
    setErrors((current) => ({ ...current, [section]: '' }));
  }

  function updateSettings(section, key, value) {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  }

  function toggleNotification(key) {
    updateSettings('notificationSettings', key, !settings.notificationSettings[key]);
  }

  function toggleFocusArea(area) {
    setSettings((current) => {
      const exists = current.aiPreferences.focusAreas.includes(area);
      return {
        ...current,
        aiPreferences: {
          ...current.aiPreferences,
          focusAreas: exists ? current.aiPreferences.focusAreas.filter((item) => item !== area) : [...current.aiPreferences.focusAreas, area],
        },
      };
    });
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();
    setPendingAction('settings');

    try {
      await saveSettings(settings);
      setMessage('settings', 'Settings saved to your account.');
    } catch (error) {
      setMessage('settings', getApiErrorMessage(error), true);
    } finally {
      setPendingAction('');
    }
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    setPendingAction('email');

    try {
      const message = await changeEmail(emailForm);
      setEmailForm((current) => ({ ...current, password: '' }));
      setMessage('email', message);
    } catch (error) {
      setMessage('email', getApiErrorMessage(error), true);
    } finally {
      setPendingAction('');
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setMessage('password', 'New passwords do not match.', true);
      return;
    }

    setPendingAction('password');

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.password,
      });
    } catch (error) {
      setMessage('password', getApiErrorMessage(error), true);
      setPendingAction('');
    }
  }

  async function handleLogoutEverywhere() {
    setPendingAction('logout');
    await logoutEverywhere();
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Settings"
        title="Control privacy, AI behavior, notifications, and account security"
        description="Settings now persist to MongoDB and update the active RiseOS session immediately."
        action={
          <PremiumButton disabled={pendingAction === 'settings'} form="settings-form" icon={pendingAction === 'settings' ? Loader2 : Save} type="submit">
            {pendingAction === 'settings' ? 'Saving' : 'Save changes'}
          </PremiumButton>
        }
      />

      <form id="settings-form" className="grid gap-4 xl:grid-cols-[0.82fr_1.18fr]" onSubmit={handleSettingsSubmit}>
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Mode" title="Interface preferences" />
          <div className="rounded-[8px] border border-champagne/20 bg-champagne/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-[8px] bg-gold-line text-night">
                <Moon size={20} />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white">Theme preference</h2>
                <p className="mt-1 text-sm text-steel">Choose a fixed dark interface or follow the system setting.</p>
              </div>
            </div>
            <select className={`${selectClass} mt-4`} value={settings.themePreference} onChange={(event) => setSettings((current) => ({ ...current, themePreference: event.target.value }))}>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="mt-4 grid gap-3">
            <Preference icon={Bell} title="Notification digest" body="Goal, habit, news, and AI nudges are controlled per category." />
            <Preference icon={Brain} title="AI tone" body="Coach style and focus areas shape recommendations across the app." />
            <Preference icon={ShieldCheck} title="Privacy controls" body="Profile and status visibility are stored on your user account." />
          </div>
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-5">
            <SectionHeader eyebrow="AI Preferences" title="Coaching controls" />
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-steel">Coaching style</p>
                <div className="grid gap-2 sm:grid-cols-4">
                  {coachingStyles.map((style) => (
                    <button
                      key={style.value}
                      className={`focus-ring rounded-[8px] border px-3 py-3 text-sm font-bold transition ${
                        settings.aiPreferences.coachingStyle === style.value
                          ? 'border-champagne/45 bg-champagne/18 text-champagne'
                          : 'border-white/10 bg-white/[0.045] text-steel hover:border-champagne/25 hover:text-white'
                      }`}
                      type="button"
                      onClick={() => updateSettings('aiPreferences', 'coachingStyle', style.value)}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-steel">Focus areas</p>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {focusAreaOptions.map((area) => (
                    <button
                      key={area}
                      className={`focus-ring flex items-center justify-between gap-2 rounded-[8px] border px-3 py-3 text-left text-sm font-bold transition ${
                        selectedFocusAreas.has(area)
                          ? 'border-mint/35 bg-mint/12 text-mint'
                          : 'border-white/10 bg-white/[0.045] text-steel hover:border-mint/25 hover:text-white'
                      }`}
                      type="button"
                      onClick={() => toggleFocusArea(area)}
                    >
                      <span>{area}</span>
                      {selectedFocusAreas.has(area) && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader eyebrow="Notifications" title="Alert controls" />
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(notificationLabels).map(([key, label]) => (
                <ToggleRow key={key} enabled={settings.notificationSettings[key]} label={label} onClick={() => toggleNotification(key)} />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader eyebrow="Privacy" title="Visibility controls" />
            <div className="grid gap-3 md:grid-cols-2">
              <SelectField
                label="Profile visibility"
                options={visibilityOptions}
                value={settings.privacySettings.profileVisibility}
                onChange={(value) => updateSettings('privacySettings', 'profileVisibility', value)}
              />
              <SelectField
                label="Status visibility"
                options={visibilityOptions}
                value={settings.privacySettings.statusVisibility}
                onChange={(value) => updateSettings('privacySettings', 'statusVisibility', value)}
              />
            </div>
            <SectionMessage error={errors.settings} message={messages.settings} />
          </GlassCard>
        </div>
      </form>

      <section className="grid gap-4 xl:grid-cols-2">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Email" title="Change email" />
          <form className="space-y-3" onSubmit={handleEmailSubmit}>
            <Field label="New email">
              <input
                className={inputClass}
                type="email"
                value={emailForm.email}
                onChange={(event) => setEmailForm((current) => ({ ...current, email: event.target.value }))}
              />
            </Field>
            <Field label="Current password">
              <input
                className={inputClass}
                type="password"
                value={emailForm.password}
                onChange={(event) => setEmailForm((current) => ({ ...current, password: event.target.value }))}
              />
            </Field>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionMessage error={errors.email} message={messages.email} />
              <PremiumButton className="sm:ml-auto" disabled={pendingAction === 'email'} icon={pendingAction === 'email' ? Loader2 : Mail} type="submit">
                {pendingAction === 'email' ? 'Updating' : 'Update email'}
              </PremiumButton>
            </div>
          </form>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Security" title="Change password" />
          <form className="space-y-3" onSubmit={handlePasswordSubmit}>
            <Field label="Current password">
              <input
                className={inputClass}
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="New password">
                <input
                  className={inputClass}
                  type="password"
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
                />
              </Field>
              <Field label="Confirm password">
                <input
                  className={inputClass}
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                />
              </Field>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionMessage error={errors.password} message={messages.password || 'Password changes sign you out for safety.'} neutral={!errors.password && !messages.password} />
              <PremiumButton className="sm:ml-auto" disabled={pendingAction === 'password'} icon={pendingAction === 'password' ? Loader2 : KeyRound} type="submit">
                {pendingAction === 'password' ? 'Updating' : 'Update password'}
              </PremiumButton>
            </div>
          </form>
        </GlassCard>
      </section>

      <GlassCard className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-[8px] bg-ember/12 text-ember">
              <LogOut size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ember">Session security</p>
              <h2 className="text-xl font-black text-white">Sign out every active device</h2>
            </div>
          </div>
          <PremiumButton disabled={pendingAction === 'logout'} icon={pendingAction === 'logout' ? Loader2 : LogOut} variant="ghost" onClick={handleLogoutEverywhere}>
            {pendingAction === 'logout' ? 'Signing out' : 'Logout everywhere'}
          </PremiumButton>
        </div>
      </GlassCard>
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

function Preference({ icon: Icon, title, body }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-center gap-3">
        <Icon size={18} className="text-champagne" />
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="mt-1 text-xs text-steel">{body}</p>
        </div>
      </div>
    </div>
  );
}

function SectionMessage({ error, message, neutral = false }) {
  if (!error && !message) return null;

  return <p className={`text-sm font-semibold ${error ? 'text-ember' : neutral ? 'text-steel' : 'text-mint'}`}>{error || message}</p>;
}

function SelectField({ label, onChange, options, value }) {
  return (
    <Field label={label}>
      <select className={selectClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function ToggleRow({ enabled, label, onClick }) {
  return (
    <button
      className="focus-ring flex w-full items-center justify-between gap-4 rounded-[8px] border border-white/10 bg-white/[0.045] p-4 text-left transition hover:border-champagne/30"
      type="button"
      onClick={onClick}
    >
      <div>
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="mt-1 text-xs text-steel">{enabled ? 'Enabled' : 'Disabled'}</p>
      </div>
      <span className={`relative h-7 w-12 shrink-0 rounded-full border transition ${enabled ? 'border-champagne/40 bg-champagne/30' : 'border-white/10 bg-white/[0.05]'}`}>
        <span className={`absolute top-1 size-5 rounded-full bg-white transition ${enabled ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}
