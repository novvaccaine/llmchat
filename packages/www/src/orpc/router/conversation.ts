import { Conversation } from "@llmchat/core/conversation/conversation";
import { os } from "@orpc/server";
import z from "zod";
import { OKOutput } from "@/orpc/output";

export const conversation = {
  create: os
    .input(z.object({ content: z.string() }))
    .output(z.object({ conversationID: z.string() }))
    .handler(async ({ input }) => {
      const conversationID = await Conversation.create(input.content);
      return { conversationID };
    }),

  list: os.output(z.array(Conversation.Entity)).handler(async () => {
    const conversations = await Conversation.list();
    return conversations;
  }),

  update: os
    .input(z.object({ title: z.string().min(1), conversationID: z.string() }))
    .output(z.object({ conversationID: z.string() }))
    .handler(async ({ input }) => {
      const conversationID = await Conversation.update(input.conversationID, {
        title: input.title,
      });
      return { conversationID };
    }),

  delete: os
    .input(z.object({ conversationID: z.string() }))
    .output(OKOutput)
    .handler(async ({ input }) => {
      await Conversation.remove(input.conversationID);
      return { message: "ok" };
    }),

  deleteAll: os.output(OKOutput).handler(async () => {
    await Conversation.remove(undefined);
    return { message: "ok" };
  }),
};
