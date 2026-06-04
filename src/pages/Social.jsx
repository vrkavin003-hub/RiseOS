import { useMemo, useState } from 'react';
import {
  Check,
  Clock3,
  Eye,
  ImagePlus,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import PremiumButton from '../components/ui/PremiumButton';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBanner from '../components/ui/StatusBanner';
import { useSocial } from '../hooks/useSocial';

const inputClass =
  'focus-ring w-full rounded-[8px] border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-steel/60 focus:border-champagne/45';

const initialStatusForm = {
  imageUrl: '',
  privacy: 'friends',
  text: '',
};

function getAvatarLetter(name = '') {
  return name.trim().charAt(0).toUpperCase() || 'R';
}

function formatTimeLeft(value) {
  if (!value) return 'Expires soon';
  const hours = Math.max(0, Math.ceil((new Date(value) - new Date()) / 3600000));
  if (hours <= 1) return 'Expires within 1 hour';
  return `${hours} hours left`;
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new window.FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function relationLabel(relation) {
  if (!relation) return 'Add friend';
  if (relation.status === 'accepted') return 'Connected';
  if (relation.status === 'pending' && relation.direction === 'incoming') return 'Respond';
  if (relation.status === 'pending') return 'Pending';
  return 'Request again';
}

export default function Social() {
  const {
    connections,
    createStatus,
    deleteStatus,
    error,
    isCreatingStatus,
    isLoading,
    isSearching,
    mutatingId,
    people,
    removeConnection,
    respondToRequest,
    searchPeople,
    sendRequest,
    statuses,
    viewStatus,
  } = useSocial();
  const [search, setSearch] = useState('');
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [statusError, setStatusError] = useState('');

  const myStatuses = useMemo(() => statuses.filter((status) => status.isMine), [statuses]);
  const networkStatuses = useMemo(() => statuses.filter((status) => !status.isMine), [statuses]);
  const allStatuses = useMemo(() => [...myStatuses, ...networkStatuses], [myStatuses, networkStatuses]);

  async function handleSearch(event) {
    event.preventDefault();

    try {
      await searchPeople(search);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleRequest(person) {
    if (person.relation?.status === 'pending' && person.relation.direction === 'incoming') {
      await handleRespond(person.relation.requestId, 'accepted');
      return;
    }

    try {
      await sendRequest(person._id);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleRespond(id, status) {
    try {
      await respondToRequest(id, status);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleRemove(id) {
    try {
      await removeConnection(id);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleStatusImage(event) {
    const [file] = event.target.files || [];
    if (!file) return;

    if (file.size > 1_200_000) {
      setStatusError('Use an image under 1.2 MB for status upload.');
      event.target.value = '';
      return;
    }

    try {
      const imageUrl = await readFileAsDataUrl(file);
      setStatusForm((current) => ({ ...current, imageUrl }));
      setStatusError('');
    } catch {
      setStatusError('Could not read that image.');
    } finally {
      event.target.value = '';
    }
  }

  async function handleCreateStatus(event) {
    event.preventDefault();
    setStatusError('');

    if (!statusForm.text.trim() && !statusForm.imageUrl) {
      setStatusError('Status needs text or an image.');
      return;
    }

    try {
      await createStatus({
        imageUrl: statusForm.imageUrl,
        privacy: statusForm.privacy,
        text: statusForm.text,
      });
      setStatusForm(initialStatusForm);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  async function handleDeleteStatus(id) {
    try {
      await deleteStatus(id);
    } catch {
      // The hook owns the rendered error message.
    }
  }

  return (
    <div className="page-shell space-y-5">
      <SectionHeader
        eyebrow="Social"
        title="Friends, requests, and 24-hour status updates"
        description="Find other RiseOS users, manage friend requests, and post short-lived text or image statuses with privacy controls."
        action={
          <PremiumButton disabled={isCreatingStatus} form="status-form" icon={isCreatingStatus ? Loader2 : Send} type="submit">
            {isCreatingStatus ? 'Posting...' : 'Post status'}
          </PremiumButton>
        }
      />

      <StatusBanner>{statusError || error}</StatusBanner>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard icon={Users} label="Friends" value={connections.accepted.length} />
        <SummaryCard icon={UserPlus} label="Incoming" value={connections.incoming.length} />
        <SummaryCard icon={Clock3} label="Outgoing" value={connections.outgoing.length} />
        <SummaryCard icon={MessageCircle} label="Live statuses" value={statuses.length} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <GlassCard className="p-5">
          <SectionHeader eyebrow="Find People" title="User search" />
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" size={17} />
              <input
                className={`${inputClass} pl-10`}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, or profession"
                value={search}
              />
            </div>
            <PremiumButton disabled={isSearching} icon={isSearching ? Loader2 : Search} type="submit" variant="ghost">
              {isSearching ? 'Searching' : 'Search'}
            </PremiumButton>
          </form>

          <div className="mt-5 space-y-3">
            {people.length > 0 ? (
              people.map((person) => (
                <PersonRow
                  actionLabel={relationLabel(person.relation)}
                  disabled={Boolean(person.relation?.status === 'accepted' || (person.relation?.status === 'pending' && person.relation.direction === 'outgoing'))}
                  key={person._id}
                  loading={mutatingId === person._id}
                  onAction={() => handleRequest(person)}
                  person={person}
                />
              ))
            ) : (
              <EmptyState title="No search results yet" body="Search for a user to send a request or accept an incoming connection." action="Search users" />
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Status" title="Post a 24-hour update" />
          <form id="status-form" className="space-y-4" onSubmit={handleCreateStatus}>
            <textarea
              className={`${inputClass} min-h-28 resize-y leading-6`}
              maxLength={280}
              onChange={(event) => setStatusForm((current) => ({ ...current, text: event.target.value }))}
              placeholder="Share a build win, learning signal, or focus update."
              value={statusForm.text}
            />
            <div className="grid gap-3 md:grid-cols-[0.8fr_1fr]">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-steel">Privacy</span>
                <select
                  className={inputClass}
                  onChange={(event) => setStatusForm((current) => ({ ...current, privacy: event.target.value }))}
                  value={statusForm.privacy}
                >
                  <option value="friends">Friends</option>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </label>
              <div className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-steel">Image status</span>
                <input className="sr-only" id="status-image" type="file" accept="image/*" onChange={handleStatusImage} />
                <label
                  className="focus-ring flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-bold text-white transition hover:border-champagne/35"
                  htmlFor="status-image"
                >
                  <ImagePlus size={17} />
                  {statusForm.imageUrl ? 'Replace image' : 'Attach image'}
                </label>
              </div>
            </div>
            {statusForm.imageUrl && (
              <div className="relative overflow-hidden rounded-[8px] border border-white/10">
                <img alt="" className="max-h-64 w-full object-cover" src={statusForm.imageUrl} />
                <button
                  aria-label="Remove status image"
                  className="focus-ring absolute right-3 top-3 grid size-9 place-items-center rounded-[8px] border border-white/10 bg-night/80 text-white"
                  onClick={() => setStatusForm((current) => ({ ...current, imageUrl: '' }))}
                  type="button"
                >
                  <X size={17} />
                </button>
              </div>
            )}
          </form>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <GlassCard className="p-5">
            <SectionHeader eyebrow="Requests" title="Incoming requests" />
            <div className="space-y-3">
              {isLoading ? (
                <LoadingSkeleton rows={3} />
              ) : connections.incoming.length > 0 ? (
                connections.incoming.map((request) => (
                  <RequestRow
                    key={request._id}
                    loading={mutatingId === request._id}
                    onAccept={() => handleRespond(request._id, 'accepted')}
                    onReject={() => handleRespond(request._id, 'rejected')}
                    request={request}
                  />
                ))
              ) : (
                <EmptyState title="No pending requests" body="New connection requests will appear here." action="Search people" />
              )}
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <SectionHeader eyebrow="Friends" title="Accepted connections" />
            <div className="space-y-3">
              {isLoading ? (
                <LoadingSkeleton rows={3} />
              ) : connections.accepted.length > 0 ? (
                connections.accepted.map((request) => (
                  <ConnectionRow
                    key={request._id}
                    loading={mutatingId === request._id}
                    onRemove={() => handleRemove(request._id)}
                    request={request}
                  />
                ))
              ) : (
                <EmptyState title="No friends yet" body="Send a friend request to start building your RiseOS network." action="Find people" />
              )}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-5">
          <SectionHeader eyebrow="Status Feed" title="Live updates" />
          <div className="space-y-4">
            {isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : allStatuses.length > 0 ? (
              allStatuses.map((status) => (
                <StatusCard
                  key={status._id}
                  loading={mutatingId === status._id}
                  onDelete={() => handleDeleteStatus(status._id)}
                  onView={() => viewStatus(status._id)}
                  status={status}
                />
              ))
            ) : (
              <EmptyState title="No live statuses" body="Post your first 24-hour update or connect with friends to see theirs." action="Post status" />
            )}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

function Avatar({ user }) {
  return (
    <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-[8px] bg-gold-line text-sm font-black text-night">
      {user?.profilePhoto ? <img alt="" className="size-full object-cover" src={user.profilePhoto} /> : getAvatarLetter(user?.name)}
    </div>
  );
}

function ConnectionRow({ loading, onRemove, request }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
      <UserSummary user={request.otherUser} />
      <PremiumButton disabled={loading} icon={Trash2} onClick={onRemove} type="button" variant="subtle">
        Remove
      </PremiumButton>
    </div>
  );
}

function PersonRow({ actionLabel, disabled, loading, onAction, person }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
      <UserSummary user={person} />
      <PremiumButton disabled={disabled || loading} icon={loading ? Loader2 : UserPlus} onClick={onAction} type="button" variant="ghost">
        {actionLabel}
      </PremiumButton>
    </div>
  );
}

function RequestRow({ loading, onAccept, onReject, request }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-3">
      <div className="flex items-center gap-3">
        <UserSummary user={request.otherUser} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <PremiumButton disabled={loading} icon={Check} onClick={onAccept} type="button">
          Accept
        </PremiumButton>
        <PremiumButton disabled={loading} icon={X} onClick={onReject} type="button" variant="ghost">
          Decline
        </PremiumButton>
      </div>
    </div>
  );
}

function StatusCard({ loading, onDelete, onView, status }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
      <div className="flex items-start justify-between gap-3">
        <UserSummary user={status.user} />
        <span className="rounded-full border border-white/10 bg-white/[0.045] px-3 py-1 text-xs font-bold text-steel">{status.privacy}</span>
      </div>
      {status.text && <p className="mt-4 text-sm leading-6 text-white">{status.text}</p>}
      {status.imageUrl && <img alt="" className="mt-4 max-h-96 w-full rounded-[8px] border border-white/10 object-cover" src={status.imageUrl} />}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-steel">
        <span>{formatDate(status.createdAt)}</span>
        <span>{formatTimeLeft(status.expiresAt)}</span>
        <span>{status.viewCount || 0} views</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!status.isMine && (
          <PremiumButton disabled={status.viewedByMe} icon={Eye} onClick={onView} type="button" variant="ghost">
            {status.viewedByMe ? 'Viewed' : 'Mark viewed'}
          </PremiumButton>
        )}
        {status.isMine && (
          <PremiumButton disabled={loading} icon={Trash2} onClick={onDelete} type="button" variant="subtle">
            Delete
          </PremiumButton>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold text-steel">{label}</p>
          <p className="mt-1 text-2xl font-black text-white">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function UserSummary({ user }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar user={user} />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{user?.name || 'RiseOS user'}</p>
        <p className="truncate text-xs text-steel">{user?.profession || user?.email || 'Growth builder'}</p>
      </div>
    </div>
  );
}
