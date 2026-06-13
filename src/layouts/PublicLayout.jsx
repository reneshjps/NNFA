import { Outlet } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col">
      {/* Minimal header */}
      <header className="py-6">
        <div className="max-w-lg mx-auto px-4 flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Narayanasamy Naidu Farmers Association
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-4">
        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} NNFA. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
