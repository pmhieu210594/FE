import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * UI / global client-side state.
 *
 * Scope: Contains only UX-related state (preferences, layout, modal toggles, etc.).
 * DO NOT place server data here — server data passes through TanStack Query.
 *
 * When adding a new slice (theme, toast queue, modal, etc.), include it in this store first;
 * Only separate it into a separate store when the state is truly independent in its lifecycle.
 */
interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "sdd-ui-state",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);
