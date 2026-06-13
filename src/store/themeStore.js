import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      darkMode:
        typeof window !== 'undefined'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false,
      applyTheme: (darkMode) => {
        if (typeof document === 'undefined') return;
        document.documentElement.classList.toggle('dark', darkMode);
        document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
      },
      setDarkMode: (darkMode) => {
        get().applyTheme(darkMode);
        set({ darkMode });
      },
      toggleDarkMode: () => {
        const darkMode = !get().darkMode;
        get().applyTheme(darkMode);
        set({ darkMode });
      },
      initTheme: () => {
        get().applyTheme(get().darkMode);
      },
    }),
    {
      name: 'nnfa-theme',
      partialize: (state) => ({ darkMode: state.darkMode }),
      onRehydrateStorage: () => (state) => {
        state?.applyTheme(state.darkMode);
      },
    }
  )
);
