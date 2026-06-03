import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, Command, Search, Sparkles } from 'lucide-react';
import { mobileNavigation, navigation, user } from '../../data/mockData';
import NotificationCenter from './NotificationCenter';

function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-11 place-items-center rounded-[8px] bg-gold-line text-lg font-black text-night shadow-gold">R</div>
      <div>
        <p className="text-base font-black text-white">RiseOS AI</p>
        <p className="text-[11px] uppercase tracking-[0.2em] text-champagne/75">Life Operating System</p>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-night/78 p-4 backdrop-blur-2xl lg:block">
      <BrandMark />
      <nav className="mt-8 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `focus-ring flex items-center gap-3 rounded-[8px] px-3 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'bg-champagne/13 text-champagne shadow-gold'
                  : 'text-steel hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4 rounded-[8px] border border-champagne/20 bg-panel-radial p-4">
        <div className="flex items-center gap-2 text-champagne">
          <Sparkles size={17} />
          <p className="text-sm font-bold">Executive Brief</p>
        </div>
        <p className="mt-2 text-xs leading-5 text-steel">Your discipline trend is strong. Put the next 48 hours into visible proof of work.</p>
      </div>
    </aside>
  );
}

function TopBar({ onOpenNotifications }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-night/72 px-4 py-3 backdrop-blur-2xl lg:ml-72">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
        <div className="lg:hidden">
          <BrandMark />
        </div>
        <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.045] px-3 py-2 text-steel lg:flex">
          <Search size={17} />
          <span className="text-sm">Search goals, skills, briefings, and notes</span>
          <div className="ml-auto flex items-center gap-1 rounded-[6px] border border-white/10 px-2 py-1 text-xs">
            <Command size={12} />
            K
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="focus-ring relative grid size-11 place-items-center rounded-[8px] border border-white/10 bg-white/7 text-steel transition hover:border-champagne/35 hover:text-white"
            onClick={onOpenNotifications}
            aria-label="Open notifications"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-ember" />
          </button>
          <div className="hidden items-center gap-3 rounded-[8px] border border-white/10 bg-white/7 px-3 py-2 sm:flex">
            <div className="grid size-9 place-items-center rounded-[8px] bg-gold-line text-sm font-black text-night">{user.avatar}</div>
            <div>
              <p className="text-sm font-bold text-white">{user.name}</p>
              <p className="text-xs text-steel">{user.level}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-night/90 px-2 py-2 backdrop-blur-2xl lg:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
        {mobileNavigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `focus-ring flex min-h-14 flex-col items-center justify-center gap-1 rounded-[8px] text-[11px] font-semibold transition ${
                isActive ? 'bg-champagne/13 text-champagne' : 'text-steel hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <item.icon size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export default function AppShell() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <TopBar onOpenNotifications={() => setNotificationsOpen(true)} />
      <NotificationCenter open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <main className="pb-24 lg:ml-72 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNavigation />
    </div>
  );
}
