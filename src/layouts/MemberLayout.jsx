import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, CreditCard, LogOut, Megaphone, Sprout } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const memberLinks = [
  { label: 'Dashboard', path: '/member/dashboard', icon: Sprout },
  { label: 'ID Card', path: '/member/id-card', icon: CreditCard },
  { label: 'Events', path: '/member/events', icon: Calendar },
  { label: 'Announcements', path: '/member/announcements', icon: Megaphone },
];

export default function MemberLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/member-login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex flex-col">
      {/* Header */}
      <header className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sprout className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-wide">
                NNFA
              </h1>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Member Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user?.name && (
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:inline">
                {user.name}
              </span>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="p-2.5 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 text-slate-500 dark:text-slate-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
        <nav className="max-w-5xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto custom-scrollbar">
          {memberLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="member-nav-active"
                      className="absolute inset-0 rounded-xl bg-emerald-500 shadow-sm"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <item.icon className="relative z-10 w-4 h-4" />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 bg-white/50 dark:bg-slate-900/50 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Narayanasamy Naidu Farmers Association. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
