import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BookOpen, Brain, CalendarCheck, CheckCheck, Loader2, Newspaper, RefreshCw, Target, Trash2, UserPlus, X } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import StatusBanner from '../ui/StatusBanner';

const typeMeta = {
  ai: { icon: Brain, tone: 'text-champagne' },
  friend: { icon: UserPlus, tone: 'text-azure' },
  goal: { icon: Target, tone: 'text-mint' },
  habit: { icon: CalendarCheck, tone: 'text-ember' },
  journal: { icon: BookOpen, tone: 'text-champagne' },
  news: { icon: Newspaper, tone: 'text-azure' },
  status: { icon: Bell, tone: 'text-mint' },
  system: { icon: Bell, tone: 'text-champagne' },
};

function formatWhen(value) {
  if (!value) return '';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

export default function NotificationCenter({
  error,
  isLoading,
  isRefreshing,
  mutatingId,
  notifications,
  onClose,
  onDelete,
  onMarkAllRead,
  onMarkRead,
  onRefresh,
  open,
  unreadCount,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.24 }}
          className="fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-md rounded-[8px] border border-white/12 bg-obsidian/95 p-4 shadow-glass backdrop-blur-2xl"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">Notification Center</h2>
              <p className="text-xs text-steel">{unreadCount} unread signal{unreadCount === 1 ? '' : 's'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Refresh notifications"
                className="focus-ring grid size-9 place-items-center rounded-[8px] border border-white/10 bg-white/7 text-steel hover:border-champagne/35 hover:text-white"
                disabled={isRefreshing}
                onClick={onRefresh}
                type="button"
              >
                {isRefreshing ? <Loader2 className="animate-spin" size={17} /> : <RefreshCw size={17} />}
              </button>
              <button
                aria-label="Mark all notifications read"
                className="focus-ring grid size-9 place-items-center rounded-[8px] border border-white/10 bg-white/7 text-steel hover:border-champagne/35 hover:text-white"
                disabled={mutatingId === 'all' || unreadCount === 0}
                onClick={onMarkAllRead}
                type="button"
              >
                <CheckCheck size={17} />
              </button>
              <button className="focus-ring rounded-[8px] p-2 text-steel hover:bg-white/8 hover:text-white" onClick={onClose} aria-label="Close notifications" type="button">
                <X size={18} />
              </button>
            </div>
          </div>

          <StatusBanner className="mb-3" size="sm">
            {error}
          </StatusBanner>

          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {isLoading ? (
              <LoadingSkeleton rows={4} />
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  mutating={mutatingId === notification._id}
                  notification={notification}
                  onDelete={() => onDelete(notification._id)}
                  onMarkRead={() => onMarkRead(notification._id)}
                />
              ))
            ) : (
              <EmptyState title="No notifications" body="Goal reminders, habit prompts, news updates, AI advice, and social alerts will appear here." action="Refresh" onAction={onRefresh} />
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function NotificationItem({ mutating, notification, onDelete, onMarkRead }) {
  const meta = typeMeta[notification.type] || typeMeta.system;
  const Icon = meta.icon;

  return (
    <div className={`rounded-[8px] border p-3 ${notification.read ? 'border-white/10 bg-white/[0.045]' : 'border-champagne/25 bg-champagne/10'}`}>
      <div className="flex gap-3">
        <div className={`grid size-9 shrink-0 place-items-center rounded-[8px] bg-white/8 ${meta.tone}`}>
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">{notification.title}</p>
            <span className="shrink-0 text-[11px] text-steel">{formatWhen(notification.createdAt)}</span>
          </div>
          {notification.body && <p className="mt-1 text-xs leading-5 text-steel">{notification.body}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {!notification.read && (
              <button className="focus-ring rounded-[8px] border border-white/10 px-3 py-1.5 text-xs font-bold text-mint hover:bg-mint/10" disabled={mutating} onClick={onMarkRead} type="button">
                Mark read
              </button>
            )}
            <button className="focus-ring inline-flex items-center gap-1 rounded-[8px] border border-white/10 px-3 py-1.5 text-xs font-bold text-steel hover:bg-white/8 hover:text-white" disabled={mutating} onClick={onDelete} type="button">
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
