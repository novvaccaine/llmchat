import { createServerFileRoute } from "@tanstack/react-start/server";
import { json } from "@tanstack/react-start";
import { authMiddleware, validationMiddleware } from "@/middlewares";
import { Conversation } from "@llmchat/core/conversation/conversation";
import z from "zod";

export const ServerRoute = createServerFileRoute("/api/conversation").methods(
  (api) => ({
    POST: api
      .middleware([
        authMiddleware,
        validationMiddleware(
          z.object({
            content: z.string(),
          }),
        ),
      ])
      .handler(async ({ context }) => {
        const conversationID = await Conversation.create(context.input.content);
        return json({ conversationID });
      }),

    GET: api.middleware([authMiddleware]).handler(async () => {
      const conversation = await Conversation.list();
      return json({ conversation });
    }),

    DELETE: api.middleware([authMiddleware]).handler(async () => {
      await Conversation.remove(undefined);
      return json({ message: "ok" });
    }),
  }),
);
