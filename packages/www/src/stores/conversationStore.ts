import { create } from "zustand";
import { Event } from "@soonagi/core/event";
import { immer } from "zustand/middleware/immer";
import { Message } from "@soonagi/core/messsage/message";

type State = {
  conversation: Record<
    string,
    {
      content: Message.Content;
      title?: string;
      status: "waiting" | "generating" | "generated" | "error";
    }
  >;
};

type Action = {
  requestGenerateContent: (conversationID: string) => void;
  // events
  onGeneratingContent: (data: Event.EventData<"generating_content">) => void;
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
            content: {
              text: "",
            },
            status: "waiting",
          };
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
          content: {
            text: "",
          },
          status: "error",
        };
      }),

    onGeneratedContent: (data) =>
      set((state) => {
        const conversation = state.conversation[data.conversationID];
        if (conversation) {
          conversation.content = {
            text: "",
          };
          conversation.status = "generated";
        }
      }),
  })),
);
