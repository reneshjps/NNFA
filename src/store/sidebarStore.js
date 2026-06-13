import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  isOpen: true,
  isMobileOpen: false,

  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),

  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  openMobile: () => set({ isMobileOpen: true }),
  closeMobile: () => set({ isMobileOpen: false }),
}));
