import { Message } from "@soonagi/core/messsage/message";
import { os } from "@orpc/server";
import z from "zod";

export const message = {
  list: os
    .input(z.object({ conversationID: z.string() }))
    .output(
      z.object({
        id: z.string(),
        title: z.string().nullable(),
        messages: z.array(Message.Entity),
      }),
    )
    .handler(async ({ input }) => {
      const conversation = await Message.list(input.conversationID);
      return conversation;
    }),

  create: os
    .input(z.object({ content: z.string().min(1), conversationID: z.string() }))
    .output(z.object({ messageID: z.string() }))
    .handler(async ({ input }) => {
      const messageID = await Message.create({ ...input, role: "user" });
      return { messageID };
    }),
};
