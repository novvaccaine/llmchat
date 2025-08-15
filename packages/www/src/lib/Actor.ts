import type { QueryClient } from "@tanstack/react-query";
import { createClient } from "@rivetkit/actor/client";
import { Event } from "@llmchat/core/event";
import { useConversationStore } from "@/stores/conversationStore";
import { orpc } from "@/orpc/client";
// TODO: ugly import path
import type { registry } from "@llmchat/stream/index";
import { toast } from "sonner";

export class Actor {
  conn: unknown | null = null;

  init(userID: string, queryClient: QueryClient) {
    if (this.conn) {
      return;
    }

    // TODO: its annoying i have to do modify this when developing locally :(
    const client = createClient<typeof registry>(
      `https://stream.${window.location.host}`,
    );

    const conn = client.stream.getOrCreate(userID).connect();
    this.conn = conn;

    // NOTE: https://github.com/rivet-gg/rivetkit/issues/1068
    conn.on(
      "generated_content",
      (data: Event.EventData<"generated_content">) => {
        queryClient
          .invalidateQueries({
            queryKey: orpc.key(),
          })
          .then(() => {
            useConversationStore.getState().onGeneratedContent(data);
          });
      },
    );

    conn.on("generated_title", (data: Event.EventData<"generated_title">) => {
      useConversationStore.getState().onGeneratedTitle(data);
    });

    conn.on(
      "generating_content",
      (data: Event.EventData<"generating_content">) => {
        useConversationStore.getState().onGeneratingContent(data);
      },
    );

    conn.on(
      "error_generating_content",
      (data: Event.EventData<"error_generating_content">) => {
        useConversationStore.getState().onError(data);
        toast.error(data.message);
      },
    );
  }
}

export const actor = new Actor();
