import { useMemo, useState } from 'react';
import { Activity, BarChart3, Database, FileText, Loader2, Newspaper, RefreshCw, ShieldCheck, Trash2, UserRound, Users } from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PremiumButton from '../components/ui/PremiumButton';
import ProgressBar from '../components/ui/ProgressBar';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBanner from '../components/ui/StatusBanner';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const inputClass =
  'focus-ring w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-3 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-steel/60 focus:border-champagne/45';

function numberFormat(value) {
  if (typeof value === 'string') return value;
  return Number(value || 0).toLocaleString();
}

function moneyFormat(value) {
  return Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatDate(value) {
  if (!value) return 'Not available';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}

function formatBytes(value) {
  const bytes = Number(value || 0);
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Admin() {
  const {
    content,
    deleteNews,
    error,
    health,
    isLoading,
    isRefreshing,
    mutatingId,
    overview,
    refreshAdmin,
    reports,
    searchUsers,
    updateUserRole,
    users,
    usersPagination,
  } = useAdminDashboard();
  const [filters, setFilters] = useState({ q: '', role: '' });

  const summaryCards = useMemo(
    () => [
      { icon: Users, label: 'Users', value: overview?.users?.users, sub: `${overview?.users?.newUsers7d || 0} new this week` },
      { icon: ShieldCheck, label: 'Verified', value: `${overview?.users?.verificationRate || 0}%`, sub: `${overview?.users?.admins || 0} admins` },
      { icon: BarChart3, label: 'Goals', value: overview?.growth?.goals, sub: `${overview?.growth?.goalCompletionRate || 0}% complete` },
      { icon: Activity, label: 'Activity', value: overview?.activity?.journals, sub: `${overview?.activity?.journal7d || 0} reviews this week` },
      { icon: Newspaper, label: 'News', value: overview?.world?.newsItems, sub: `${overview?.social?.activeStatuses || 0} active statuses` },
      { icon: Database, label: 'Net tracked', value: moneyFormat(overview?.finance?.netTracked), sub: 'Income minus expenses' },
    ],
    [overview],
  );

  async function handleSearch(event) {
    event.preventDefault();
    await searchUsers({ ...filters, page: 1 }).catch(() => {});
  }

  async function handleClearFilters() {
    const nextFilters = { q: '', role: '' };
    setFilters(nextFilters);
    await searchUsers({ ...nextFilters, page: 1 }).catch(() => {});
  }

  async function handleRoleChange(user, role) {
    if (role === user.role) return;
    await updateUserRole(user._id, role).catch(() => {});
  }

  async function handleDeleteNews(id) {
    await deleteNews(id).catch(() => {});
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Admin"
        title="System operations dashboard"
        description="Monitor users, growth metrics, reports, content, and system health from one role-gated control plane."
        action={
          <PremiumButton disabled={isRefreshing} icon={isRefreshing ? Loader2 : RefreshCw} onClick={() => refreshAdmin().catch(() => {})} type="button">
            {isRefreshing ? 'Refreshing' : 'Refresh'}
          </PremiumButton>
        }
      />

      <StatusBanner>{error}</StatusBanner>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} loading={isLoading} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Users" title="User management" />
          <form className="mb-4 grid gap-3 md:grid-cols-[1fr_0.42fr_auto]" onSubmit={handleSearch}>
            <input
              className={inputClass}
              onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              placeholder="Search users"
              value={filters.q}
            />
            <select className={inputClass} onChange={(event) => setFilters((current) => ({ ...current, role: event.target.value }))} value={filters.role}>
              <option value="">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
            <PremiumButton disabled={mutatingId === 'users'} icon={UserRound} type="submit" variant="ghost">
              Search
            </PremiumButton>
          </form>

          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.12em] text-steel">
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-3">User</th>
                    <th className="py-3 pr-3">Role</th>
                    <th className="py-3 pr-3">Verified</th>
                    <th className="py-3 pr-3">Joined</th>
                    <th className="py-3 pr-3">Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-white/8">
                      <td className="py-3 pr-3">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-steel">{user.email}</p>
                      </td>
                      <td className="py-3 pr-3">
                        <select
                          className="focus-ring rounded-[8px] border border-white/10 bg-ink px-3 py-2 text-sm font-bold text-white"
                          disabled={mutatingId === user._id}
                          onChange={(event) => handleRoleChange(user, event.target.value)}
                          value={user.role}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 pr-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.emailVerified ? 'bg-mint/12 text-mint' : 'bg-ember/12 text-ember'}`}>
                          {user.emailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-steel">{formatDate(user.createdAt)}</td>
                      <td className="py-3 pr-3 text-steel">{formatDate(user.lastLoginAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usersPagination && (
                <p className="mt-4 text-xs font-semibold text-steel">
                  Showing page {usersPagination.page} of {usersPagination.pages} | {usersPagination.total} users
                </p>
              )}
            </div>
          ) : (
            <EmptyState title="No users found" body="Try a different role or search query." action="Clear filters" onAction={handleClearFilters} />
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Health" title="System health" />
          {isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="space-y-4">
              <HealthRow label="Database" value={health?.database || 'unknown'} good={health?.database === 'connected'} />
              <HealthRow label="Runtime" value={health?.environment?.nodeEnv || 'development'} good />
              <HealthRow label="Mongo URI" value={health?.environment?.hasMongoUri ? 'Configured' : 'Missing'} good={health?.environment?.hasMongoUri} />
              <HealthRow label="News API" value={health?.environment?.hasNewsKey ? 'Configured' : 'Missing'} good={health?.environment?.hasNewsKey} />
              <HealthRow label="AI keys" value={health?.environment?.hasOpenAiKey || health?.environment?.hasGeminiKey ? 'Configured' : 'Fallback'} good />
              <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                <p className="text-xs font-semibold text-steel">Uptime</p>
                <p className="mt-1 text-xl font-black text-white">{numberFormat(health?.uptimeSeconds)}s</p>
              </div>
              <div>
                <ProgressBar label="Heap used" value={Math.min(100, Math.round(((health?.memory?.heapUsed || 0) / Math.max(health?.memory?.heapTotal || 1, 1)) * 100))} color="#6EC6FF" />
                <p className="mt-2 text-xs text-steel">
                  {formatBytes(health?.memory?.heapUsed)} / {formatBytes(health?.memory?.heapTotal)}
                </p>
              </div>
            </div>
          )}
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.94fr_1.06fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Reports" title="Recent activity reports" />
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <div className="space-y-4">
              <ReportGroup icon={FileText} items={reports?.journals || []} label="Journal reports" pickTitle={(item) => item.whatILearned || item.whatIBuilt || 'Journal entry'} />
              <ReportGroup icon={BarChart3} items={reports?.goals || []} label="Goal reports" pickTitle={(item) => item.title} />
              <ReportGroup icon={Activity} items={reports?.aiChats || []} label="AI sessions" pickTitle={(item) => item.title} />
              <ReportGroup icon={ShieldCheck} items={reports?.businessIdeas || []} label="Business ideas" pickTitle={(item) => item.idea} />
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Content" title="Content and signal monitor" />
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-steel">News intelligence</p>
                <div className="space-y-3">
                  {(content?.news || []).slice(0, 6).map((item) => (
                    <div key={item._id} className="flex items-start justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
                      <div>
                        <p className="text-sm font-bold text-white">{item.headline}</p>
                        <p className="mt-1 text-xs text-steel">{item.category || item.source || 'News'} | Impact {item.impactScore || 0}</p>
                      </div>
                      <PremiumButton disabled={mutatingId === item._id} icon={Trash2} onClick={() => handleDeleteNews(item._id)} type="button" variant="subtle">
                        Remove
                      </PremiumButton>
                    </div>
                  ))}
                  {(content?.news || []).length === 0 && <EmptyState title="No news content" body="Live news items will appear after the feed refreshes." action="Refresh" onAction={() => refreshAdmin().catch(() => {})} />}
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <MiniPanel label="Live statuses" value={content?.statuses?.length || 0} />
                <MiniPanel label="Recent notifications" value={content?.notifications?.length || 0} />
              </div>
            </div>
          )}
        </GlassCard>
      </section>
    </div>
  );
}

function HealthRow({ good, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
      <span className="text-sm font-semibold text-steel">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-bold ${good ? 'bg-mint/12 text-mint' : 'bg-ember/12 text-ember'}`}>{value}</span>
    </div>
  );
}

function MiniPanel({ label, value }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
      <p className="text-xs font-semibold text-steel">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{numberFormat(value)}</p>
    </div>
  );
}

function ReportGroup({ icon: Icon, items, label, pickTitle }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-steel">
        <Icon className="text-champagne" size={15} />
        {label}
      </p>
      <div className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <div key={item._id} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
            <p className="line-clamp-1 text-sm font-bold text-white">{pickTitle(item)}</p>
            <p className="mt-1 text-xs text-steel">{item.user?.name || 'Unknown user'} | {formatDate(item.updatedAt || item.createdAt)}</p>
          </div>
        ))}
        {items.length === 0 && <p className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3 text-sm text-steel">No recent records.</p>}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, loading, sub, value }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-steel">{label}</p>
          <p className="mt-1 text-2xl font-black text-white">{loading ? '--' : numberFormat(value)}</p>
          <p className="mt-1 truncate text-xs text-steel">{sub}</p>
        </div>
      </div>
    </GlassCard>
  );
}
