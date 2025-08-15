import { create } from "zustand";
import { Event } from "@soonagi/core/event";
import { immer } from "zustand/middleware/immer";

type State = {
  conversation: Record<
    string,
    {
      content: string;
      title?: string;
      status: "waiting" | "generating" | "generated" | "error";
    }
  >;
};

type Action = {
  requestGenerateContent: (conversationID: string) => void;
  rename: (conversationID: string, title: string) => void;
  // events
  onGeneratingContent: (data: Event.EventData<"generating_content">) => void;
  onGeneratedTitle: (data: Event.EventData<"generated_title">) => void;
  onGeneratedContent: (data: Event.EventData<"generating_content">) => void;
  onError: (data: Event.EventData<"error_generating_content">) => void;
};

export const useConversationStore = create<State & Action>()(
  immer((set) => ({
    conversation: {},

    requestGenerateContent: (conversationID: string) =>
      set((state) => {
        const conversation = state.conversation[conversationID];
        if (conversation) {
          conversation.status = "waiting";
        } else {
          state.conversation[conversationID] = {
            content: "",
            status: "waiting",
          };
        }
      }),

    rename: (conversationID, title) =>
      set((state) => {
        const conversation = state.conversation[conversationID];
        if (conversation) {
          conversation.title = title;
        }
      }),

    onGeneratingContent: (data) =>
      set((state) => {
        const conversation = state.conversation[data.conversationID];
        state.conversation[data.conversationID] = {
          content: data.content,
          title: data.title ?? conversation?.title,
          status: "generating",
        };
      }),

    onError: (data) =>
      set((state) => {
        state.conversation[data.conversationID] = {
          content: "",
          status: "error",
        };
      }),

    onGeneratedTitle: (data) =>
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
