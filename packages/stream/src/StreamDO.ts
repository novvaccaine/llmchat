import { Actor } from "@llmchat/core/actor";
import { AI } from "@llmchat/core/ai";
import { Event } from "@llmchat/core/event";
import { DurableObject } from "cloudflare:workers";

export class StreamDO extends DurableObject {
  conversation: Record<string, string> = {};
  env: Cloudflare.Env;

  constructor(ctx: DurableObjectState, env: Cloudflare.Env) {
    super(ctx, env);
    this.env = env;

    ctx.blockConcurrencyWhile(async () => {
      this.conversation = (await ctx.storage.get("streams")) || {};
    });
  }

  async fetch(): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
    this.ctx.acceptWebSocket(server);
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  async generateContent(conversationID: string, userID: string, model: string) {
    Actor.provide("user", { userID }, async () => {
      try {
        const stream = await AI.generateContent({
          conversationID,
          model,

          onFinish: (content: string) => {
            this.publishEvent({
              type: "generated_content",
              data: {
                content,
                conversationID,
              },
            });
            delete this.conversation[conversationID];
          },

          onTitleGenerate: (title) => {
            this.publishEvent({
              type: "generated_title",
              data: {
                title,
                conversationID,
              },
            });
          },
        });

        for await (const chunk of stream.textStream) {
          if (!this.conversation[conversationID]) {
            this.conversation[conversationID] = chunk;
          } else {
            this.conversation[conversationID] += chunk;
          }
          this.publishEvent({
            type: "generating_content",
            data: {
              conversationID,
              content: this.conversation[conversationID],
            },
          });
        }
      } catch (err) {
        console.error("failed to generate content", err);
      }
    });
  }

  publishEvent(event: Event.Event) {
    const sockets = this.ctx.getWebSockets();
    for (const socket of sockets) {
      socket.send(JSON.stringify(event));
    }
  }

  async webSocketClose(ws: WebSocket, code: number) {
    ws.close(code, "durable object is closing websocket");
  }
}
