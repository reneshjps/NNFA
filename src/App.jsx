import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { useThemeStore } from './store/themeStore';
import { useAuthStore } from './store/authStore';
import { router } from './routes';
import ErrorBoundary from './components/feedback/ErrorBoundary';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import toast from 'react-hot-toast';

function SupabaseSetupNotice() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-green-100 bg-white p-8 shadow-xl shadow-green-900/10 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-700 dark:text-green-400">
            Setup required
          </p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Supabase is not configured
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Add your real Supabase project URL and anon key in the local `.env` file, then restart the dev server.
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 font-mono text-sm text-gray-800 dark:bg-slate-900 dark:text-gray-100">
          <div>VITE_SUPABASE_URL=https://your-project.supabase.co</div>
          <div>VITE_SUPABASE_ANON_KEY=your-anon-key</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const { initTheme, darkMode } = useThemeStore();
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    initTheme();

    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return undefined;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentRole = useAuthStore.getState().role;
        if (currentRole === 'member') {
          setLoading(false);
          return;
        }

        setLoading(true);
        if (session?.user) {
          try {
            // Fetch admin profile
            const { data: profile, error } = await supabase
              .from('admins')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            if (error) {
              console.error('Error fetching admin profile:', error);
              toast.error('Error fetching admin profile');
              await supabase.auth.signOut();
              clearAuth();
            } else if (!profile) {
              toast.error('This account is not registered as an administrator.');
              await supabase.auth.signOut();
              clearAuth();
            } else if (profile.status === 'disabled') {
              toast.error('Your administrator account has been disabled.');
              await supabase.auth.signOut();
              clearAuth();
            } else {
              // Valid active admin profile found
              setAuth(
                {
                  id: profile.id,
                  name: profile.name,
                  email: profile.email,
                  phone: profile.phone,
                },
                profile.role, // 'super_admin' or 'admin'
                session
              );
            }
          } catch (err) {
            console.error('Auth state change handler failed:', err);
            clearAuth();
          } finally {
            setLoading(false);
          }
        } else {
          // No active Supabase session
          const currentRole = useAuthStore.getState().role;
          // If logged in as member, do NOT clear the session since members don't use Supabase Auth
          if (currentRole !== 'member') {
            clearAuth();
          }
          setLoading(false);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [initTheme, setAuth, clearAuth, setLoading]);

  if (!isSupabaseConfigured) {
    return <SupabaseSetupNotice />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: darkMode ? '#1e293b' : '#ffffff',
              color: darkMode ? '#f1f5f9' : '#0f172a',
              border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
