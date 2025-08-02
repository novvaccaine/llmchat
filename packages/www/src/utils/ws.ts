import { Event } from "@llmchat/core/event";
import { WebSocket } from "partysocket";
import { useConversationStore } from "./conversationStore";
import { queryClient } from ".";

export class WS {
  socket: WebSocket | null = null;

  init() {
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
            const keys = [
              ["conversation"],
              ["conversation", event.data.conversationID],
            ];
            Promise.all(
              keys.map((queryKey) =>
                queryClient.invalidateQueries({
                  queryKey,
                  refetchType: "all",
                }),
              ),
            ).then(() => {
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
