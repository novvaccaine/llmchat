import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  _hasHydrated: boolean;
  sidebarOpen: boolean;
};

type Action = {
  toggleSidebar: () => void;
  setHasHydrated: (hydrated: boolean) => void;
};

export const useUIStore = create<State & Action>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({
          _hasHydrated: state,
        });
      },

      toggleSidebar: () => set(() => ({ sidebarOpen: !get().sidebarOpen })),
    }),
    {
      name: "uiStore",
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    },
  ),
);
