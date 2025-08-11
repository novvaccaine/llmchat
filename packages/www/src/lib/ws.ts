import { Event } from "@llmchat/core/event";
import { WebSocket } from "partysocket";
import { useConversationStore } from "@/stores/conversationStore";
import { QueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";
import { toast } from "sonner";

export class WS {
  socket: WebSocket | null = null;

  init(queryClient: QueryClient) {
    if (this.socket) {
      return;
    }

    // TODO: handle this via config
    const socket = new WebSocket("ws://localhost:8787/ws");
    this.socket = socket;

    socket.addEventListener("open", function () {
      console.log("connected to the websocket server");
    });

    socket.addEventListener("message", function (message) {
      try {
        const event: Event.Event = JSON.parse(message.data);
        switch (event.type) {
          case "generated_content": {
            queryClient
              .invalidateQueries({
                queryKey: orpc.key(),
              })
              .then(() => {
                useConversationStore.getState().onGeneratedContent(event.data);
              });
            break;
          }
          case "generating_content": {
            useConversationStore.getState().onGeneratingContent(event.data);
            break;
          }
          case "generated_title": {
            useConversationStore.getState().onGeneratedTitle(event.data);
            break;
          }
          case "error_generating_content": {
            useConversationStore.getState().onError(event.data);
            toast.error("Failed to generate content");
            break;
          }
          default: {
            console.warn("received unknown event", event);
          }
        }
      } catch (err) {
        console.error("failed to parse message", err);
      }
    });

    socket.addEventListener("close", function (event) {
      console.log("disconnected from the websocket server", event.code);
    });

    socket.addEventListener("error", function (event) {
      console.error("websocket error", event);
    });
  }
}

export const ws = new WS();
