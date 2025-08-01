import { create } from "zustand";
import { Event } from "@llmchat/core/event";

type State = {
  conversation: Record<
    string,
    { content: string; title?: string; generated: boolean }
  >;
};

type Actions = {
  onGeneratingContent: (event: Event.GeneratingContent) => void;
  onGeneratedContent: (event: Event.GeneratedContent) => void;
  onGeneratedTitle: (event: Event.GeneratedTitle) => void;
};

export const useStreamStore = create<State & Actions>()((set) => ({
  conversation: {},

  onGeneratingContent: (event) =>
    set((state) => {
      const data = event.data;

      let entry = state.conversation[data.conversationID];
      if (!entry) {
        entry = { content: data.content, generated: false };
      }
      entry.content = data.content;

      return {
        ...state,
        conversation: {
          ...state.conversation,
          [data.conversationID]: entry,
        },
      };
    }),

  onGeneratedContent: (event) =>
    set((state) => {
      const data = event.data;

      let entry = state.conversation[data.conversationID];
      if (!entry) {
        entry = { content: data.content, generated: true };
      }
      entry.content = data.content;
      entry.generated = true;

      return {
        ...state,
        conversation: {
          ...state.conversation,
          [data.conversationID]: entry,
        },
      };
    }),

  onGeneratedTitle: (event) =>
    set((state) => {
      const data = event.data;

      let entry = state.conversation[data.conversationID];
      if (!entry) {
        entry = { content: "", generated: false, title: data.title };
      }
      entry.title = data.title;

      return {
        ...state,
        conversation: {
          ...state.conversation,
          [data.conversationID]: entry,
        },
      };
    }),
}));
