import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Calendar,
  Bell,
  ClipboardList,
  RefreshCw,
  BarChart3,
  Upload,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  Sprout,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useSidebarStore } from '../../store/sidebarStore';
import { cn } from '../../lib/utils';

const adminMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Members', icon: Users, path: '/admin/members' },
  { label: 'Add Member', icon: UserPlus, path: '/admin/members/add' },
  { label: 'Renewals', icon: RefreshCw, path: '/admin/renewals' },
  { label: 'Reports', icon: BarChart3, path: '/admin/reports' },
  { label: 'Excel Import', icon: Upload, path: '/admin/import-members' },
  { label: 'Events', icon: Calendar, path: '/admin/events' },
  { label: 'Notifications', icon: Bell, path: '/admin/notifications' },
  { label: 'ID Cards', icon: FileText, path: '/admin/id-cards' },
];

const superAdminMenuItems = [
  { label: 'Admin Management', icon: Shield, path: '/admin/manage-admins' },
  { label: 'Activity Logs', icon: ClipboardList, path: '/admin/activity-logs' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function Sidebar() {
  const { role, user, clearAuth } = useAuthStore();
  const { isOpen, toggle, isMobileOpen, closeMobile } = useSidebarStore();
  const navigate = useNavigate();

  const isSuperAdmin = role === 'super_admin';

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const menuContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-[72px] shrink-0 items-center gap-3 px-6 border-b border-emerald-400/10 dark:border-slate-700/50">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 backdrop-blur-md border border-emerald-500/20">
          <Sprout className="h-6 w-6" />
        </div>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-sm font-bold leading-tight text-white tracking-wide">NNFA</h1>
              <p className="text-[10px] text-emerald-400 font-medium">Farmers Association</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1 custom-scrollbar">
        <p className={cn("px-3 mb-3 text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest transition-opacity duration-300", !isOpen && "opacity-0")}>
          Main Menu
        </p>
        {adminMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={closeMobile}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <item.icon className={cn("relative z-10 h-5 w-5 shrink-0 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} />
                <AnimatePresence>
                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="relative z-10 truncate whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}

        {isSuperAdmin && (
          <>
            <div className="my-6 border-t border-slate-700/50" />
            <p className={cn("px-3 mb-3 text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest transition-opacity duration-300", !isOpen && "opacity-0")}>
              Administration
            </p>
            {superAdminMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 relative',
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-admin"
                        className="absolute inset-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <item.icon className={cn("relative z-10 h-5 w-5 shrink-0 transition-colors", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400")} />
                    <AnimatePresence>
                      {isOpen && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          className="relative z-10 truncate whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-slate-700/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700">
            <span className="text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 overflow-hidden whitespace-nowrap"
              >
                <p className="truncate text-sm font-medium text-white">
                  {user?.name || 'Admin'}
                </p>
                <p className="capitalize text-[10px] text-slate-400 font-medium">
                  {role?.replace('_', ' ')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {isOpen && (
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400 shrink-0"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? 280 : 88 }}
        transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        className="hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col bg-[#0B1120] shadow-2xl border-r border-slate-800"
      >
        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="absolute -right-3.5 top-8 z-50 flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow-sm transition-colors hover:bg-slate-700 hover:text-slate-200"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !isOpen && "rotate-180")} />
        </button>

        <div className="relative z-10 h-full">
          {menuContent}
        </div>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={closeMobile}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute left-0 top-0 flex h-full w-[280px] flex-col bg-[#0B1120] shadow-2xl"
            >
              <button
                onClick={closeMobile}
                className="absolute right-4 top-6 z-50 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="relative z-10 h-full">
                {menuContent}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
