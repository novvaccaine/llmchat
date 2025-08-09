import { create } from "zustand";
import { Event } from "@llmchat/core/event";
import { immer } from "zustand/middleware/immer";

type State = {
  conversation: Record<
    string,
    {
      content: string;
      title?: string;
      status: "waiting" | "generating" | "generated";
    }
  >;
};

type Action = {
  newConversation: (conversationID: string) => void;
  onGeneratingContent: (data: Event.EventData<"generating_content">) => void;
  onGeneratingTitle: (data: Event.EventData<"generated_title">) => void;
  onGeneratedContent: (data: Event.EventData<"generating_content">) => void;
};

export const useConversationStore = create<State & Action>()(
  immer((set) => ({
    waitingForStream: true,
    conversation: {},

    newConversation: (conversationID: string) =>
      set((state) => {
        state.conversation[conversationID] = {
          content: "",
          status: "waiting",
        };
      }),

    onGeneratingContent: (data) =>
      set((state) => {
        const conversation = state.conversation[data.conversationID];
        state.conversation[data.conversationID] = {
          content: data.content,
          title: data.title ?? conversation.title,
          status: "generating",
        };
      }),

    onGeneratingTitle: (data) =>
      set((state) => {
        state.conversation[data.conversationID] = {
          content: "",
          title: data.title,
          status: "generating",
        };
      }),

    onGeneratedContent: (data) =>
      set((state) => {
        const conversation = state.conversation[data.conversationID];
        if (conversation) {
          conversation.content = "";
          conversation.status = "generated";
        }
      }),
  })),
);
