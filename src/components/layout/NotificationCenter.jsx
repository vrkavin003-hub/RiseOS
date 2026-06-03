import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { notifications } from '../../data/mockData';

export default function NotificationCenter({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.24 }}
          className="fixed right-4 top-20 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-[8px] border border-white/12 bg-obsidian/95 p-4 shadow-glass backdrop-blur-2xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Notification Center</h2>
              <p className="text-xs text-steel">Signals that need attention</p>
            </div>
            <button className="focus-ring rounded-[8px] p-2 text-steel hover:bg-white/8 hover:text-white" onClick={onClose} aria-label="Close notifications">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.icon;
              return (
                <div key={notification.title} className="rounded-[8px] border border-white/10 bg-white/[0.055] p-3">
                  <div className="flex gap-3">
                    <div className="grid size-9 shrink-0 place-items-center rounded-[8px] bg-champagne/12 text-champagne">
                      <Icon size={17} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white">{notification.title}</p>
                        <span className="text-[11px] text-steel">{notification.time}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-steel">{notification.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
