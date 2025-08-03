import { createServerFileRoute } from "@tanstack/react-start/server";
import { json } from "@tanstack/react-start";
import { authMiddleware, validationMiddleware } from "@/middlewares";
import { Message } from "@llmchat/core/messsage/message";
import z from "zod";

export const ServerRoute = createServerFileRoute(
  "/api/conversation/$conversationID",
).methods((api) => ({
  GET: api.middleware([authMiddleware]).handler(async ({ params }) => {
    const conversation = await Message.list(params.conversationID);
    return json({ conversation });
  }),

  PUT: api
    .middleware([
      authMiddleware,
      validationMiddleware(z.object({ content: z.string() })),
    ])
    .handler(async ({ params, context }) => {
      const messageID = await Message.create({
        content: context.input.content,
        conversationID: params.conversationID,
        role: "user",
      });
      return json({ messageID });
    }),
}));
