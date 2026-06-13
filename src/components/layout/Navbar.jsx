import { Menu, Moon, Sun, Bell, Search } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { isOpen, openMobile } = useSidebarStore();
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-[72px] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300',
        isOpen ? 'lg:ml-[280px]' : 'lg:ml-[88px]'
      )}
    >
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={openMobile}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 rounded-full px-4 py-2.5 w-80 lg:w-96 border border-transparent focus-within:border-emerald-500/50 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300 shadow-sm">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search members, events, or reports..."
              className="bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none w-full"
            />
            <kbd className="hidden md:inline-flex text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.button 
            onClick={() => navigate('/admin/notifications')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </motion.button>

          {/* Dark mode toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
