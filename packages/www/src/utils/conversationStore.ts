import { create } from "zustand";
import { Event } from "@llmchat/core/event";
import { immer } from "zustand/middleware/immer";

type State = {
  conversation: Record<string, { content: string; title?: string }>;
};

type Action = {
  onGeneratingContent: (data: Event.EventData<"generating_content">) => void;
  onGeneratedTitle: (data: Event.EventData<"generated_title">) => void;
  onGeneratedContent: (data: Event.EventData<"generating_content">) => void;
};

export const useConversationStore = create<State & Action>()(
  immer((set) => ({
    conversation: {},

    onGeneratingContent: (data) =>
      set((state) => {
        state.conversation[data.conversationID] = {
          content: data.content,
          title: data.title,
        };
      }),

    onGeneratedTitle: (data) =>
      set((state) => {
        const entry = state.conversation[data.conversationID];
        if (!entry) {
          state.conversation[data.conversationID] = {
            content: "",
            title: data.title,
          };
        } else {
        }
      }),

    onGeneratedContent: (data) =>
      set((state) => {
        delete state.conversation[data.conversationID];
      }),
  })),
);
