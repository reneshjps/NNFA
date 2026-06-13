import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { useSidebarStore } from '../store/sidebarStore';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
  const { isOpen } = useSidebarStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 min-h-screen flex flex-col',
          isOpen ? 'lg:ml-[280px]' : 'lg:ml-[88px]'
        )}
      >
        <Navbar />
        <main className="flex-1 p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="h-full max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
