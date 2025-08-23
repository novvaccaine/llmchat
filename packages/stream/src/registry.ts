import { actor, setup } from "@rivetkit/actor";
import { auth } from "@soonagi/core/auth/index";
import { Unauthorized } from "@rivetkit/actor/errors";
import { AI } from "@soonagi/core/ai";
import type { Event } from "@soonagi/core/event";
import { z } from "zod";
import { env } from "@soonagi/core/env";
import { Message } from "@soonagi/core/messsage/message";
// oopsie, this is different actor (no relation with rivet actor)
import { Actor } from "@soonagi/core/actor";

export const generateContentActionInput = z.object({
  apiKey: z.string(),
  userID: z.string(),
  conversationID: z.string(),
  model: z.string(),
  webSearch: z.boolean(),
});

export const stream = actor({
  state: {
    conversation: {} as Record<
      string,
      { title?: string; content: Message.Content }
    >,
  },

  onAuth: async (opts) => {
    const { request } = opts;
    const authResult = await auth.api.getSession({
      headers: request.headers,
    });
    if (!authResult) throw new Unauthorized();
    return {
      userID: authResult.user.id,
    };
  },

  actions: {
    generateContent: (c, input: z.infer<typeof generateContentActionInput>) => {
      if (input.apiKey !== env.SVC_API_KEY) {
        throw new Unauthorized();
      }

      // NOTE: skill issues in typescript, so defining this here
      function publishEvent(event: Event.Event) {
        c.broadcast(event.type, event.data);
      }

      return Actor.provide("user", { userID: input.userID }, async () => {
        const { conversationID, model, webSearch } = input;

        const stream = AI.generateContent({
          conversationID,
          model,
          webSearch,

          onFinish: () => {
            const conversation = c.state.conversation[conversationID];
            publishEvent({
              type: "generated_content",
              data: {
                conversationID,
                ...conversation,
              },
            });
            delete c.state.conversation[conversationID];
          },

          onTitleGenerate: (title) => {
            const conversation = {
              title,
              content: {
                text: "",
              },
            };
            c.state.conversation[conversationID] = conversation;
            publishEvent({
              type: "generating_content",
              data: {
                conversationID,
                ...conversation,
              },
            });
          },

          onError: (message) => {
            publishEvent({
              type: "error_generating_content",
              data: {
                conversationID,
                message,
              },
            });
            delete c.state.conversation[conversationID];
          },
        });

        for await (const content of stream) {
          publishEvent({
            type: "generating_content",
            data: {
              conversationID,
              ...content,
            },
          });
        }

        return c.state.conversation[conversationID];
      });
    },
  },
});

export const registry = setup({
  use: { stream },
});
