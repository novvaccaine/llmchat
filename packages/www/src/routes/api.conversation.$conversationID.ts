import { createServerFileRoute } from "@tanstack/react-start/server";
import { json } from "@tanstack/react-start";
import { authMiddleware, validationMiddleware } from "@/middlewares";
import z from "zod";
import { Conversation } from "@llmchat/core/conversation/conversation";

export const ServerRoute = createServerFileRoute(
  "/api/conversation/$conversationID",
).methods((api) => ({
  DELETE: api.middleware([authMiddleware]).handler(async ({ params }) => {
    await Conversation.remove(params.conversationID);
    return json({ message: "ok" });
  }),

  PUT: api
    .middleware([
      authMiddleware,
      validationMiddleware(z.object({ title: z.string().min(1) })),
    ])
    .handler(async ({ params, context }) => {
      const conversationID = await Conversation.update(params.conversationID, {
        title: context.input.title,
      });
      return json({ conversationID });
    }),
}));
