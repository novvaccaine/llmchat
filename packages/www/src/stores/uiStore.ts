import { Conversation } from "@soonagi/core/conversation/conversation";
import { Model } from "@soonagi/core/model";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Dialog =
  | {
      type: "delete_conversation";
      data: Conversation.Entity;
    }
  | {
      type: "rename_conversation";
      data: Conversation.Entity;
    }
  | {
      type: "login_alert";
    };

type State = {
  _hasHydrated: boolean;
  sidebarOpen: boolean;
  sidebarDrawerOpen: boolean;
  dialog: Dialog | null;
  selectedModel: string;
};

type Action = {
  toggleSidebar: () => void;
  toggleDrawerSidebar: () => void;
  closeDrawer: () => void;
  selectModel: (model: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
  setDialog: (dialog: Dialog | null) => void;
};

export const useUIStore = create<State & Action>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      sidebarDrawerOpen: false,
      _hasHydrated: false,
      dialog: null,
      selectedModel: Model.DEFAULT_MODEL,

      toggleSidebar: () => set(() => ({ sidebarOpen: !get().sidebarOpen })),
      toggleDrawerSidebar: () =>
        set((state) => ({ sidebarDrawerOpen: !state.sidebarDrawerOpen })),
      closeDrawer: () => set(() => ({ sidebarDrawerOpen: false })),

      selectModel: (model) => set(() => ({ selectedModel: model })),

      setHasHydrated: (hydrated) => set(() => ({ _hasHydrated: hydrated })),
      setDialog: (dialog) => set(() => ({ dialog })),
    }),
    {
      name: "uiStore",
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        selectedModel: state.selectedModel,
      }),
    },
  ),
);
