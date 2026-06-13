import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      role: null, // 'super_admin', 'admin', 'member'
      session: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, role, session) =>
        set({
          user,
          role,
          session,
          isAuthenticated: true,
          isLoading: false,
        }),

      clearAuth: () =>
        set({
          user: null,
          role: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      isSuperAdmin: () => get().role === 'super_admin',
      isAdmin: () => get().role === 'admin' || get().role === 'super_admin',
      isMember: () => get().role === 'member',
    }),
    {
      name: 'nnfa-auth',
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
