import { Conversation } from "@llmchat/core/conversation/conversation";
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
  dialog: Dialog | null;
};

type Action = {
  toggleSidebar: () => void;
  setHasHydrated: (hydrated: boolean) => void;
  setDialog: (dialog: Dialog | null) => void;
};

export const useUIStore = create<State & Action>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      _hasHydrated: false,
      dialog: null,

      setHasHydrated: (hydrated) => set(() => ({ _hasHydrated: hydrated })),

      setDialog: (dialog) => set(() => ({ dialog })),

      toggleSidebar: () => set(() => ({ sidebarOpen: !get().sidebarOpen })),
    }),
    {
      name: "uiStore",
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    },
  ),
);
