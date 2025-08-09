import { create } from "zustand";
import { Event } from "@llmchat/core/event";
import { immer } from "zustand/middleware/immer";

type State = {
  conversation: Record<
    string,
    { content: string; title?: string; generating: boolean }
  >;
};

type Action = {
  onGeneratingContent: (data: Event.EventData<"generating_content">) => void;
  onGeneratingTitle: (data: Event.EventData<"generated_title">) => void;
  onGeneratedContent: (data: Event.EventData<"generating_content">) => void;
};

export const useConversationStore = create<State & Action>()(
  immer((set) => ({
    conversation: {},

    onGeneratingContent: (data) =>
      set((state) => {
        const conversation = state.conversation[data.conversationID];
        state.conversation[data.conversationID] = {
          content: data.content,
          title: data.title ?? conversation.title,
          generating: true,
        };
      }),

    onGeneratingTitle: (data) =>
      set((state) => {
        state.conversation[data.conversationID] = {
          content: "",
          title: data.title,
          generating: true,
        };
      }),

    onGeneratedContent: (data) =>
      set((state) => {
        const conversation = state.conversation[data.conversationID];
        if (conversation) {
          conversation.content = "";
          conversation.generating = false;
        }
      }),
  })),
);
