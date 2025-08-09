import { Messages } from "@/components/Messages";
import { ChatInput } from "@/components/ChatInput";
import type { Message } from "@llmchat/core/messsage/message";
import { useCreateConversation } from "@/utils/conversation";
import { useUpdateMessages } from "@/utils/message";
import { toast } from "sonner";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useConversationStore } from "@/utils/conversationStore";
import { createServerFn } from "@tanstack/react-start";
import z from "zod";
import { getCookie } from "@tanstack/react-start/server";
import { cn } from "@/utils";
import { motion } from "motion/react";
import { env } from "@llmchat/core/env";
import { useEffect } from "react";

type Props = {
  messages: Message.Entity[];
};

const model = "openai/gpt-4.1-mini";

const startStream = createServerFn({ method: "POST" })
  .validator(
    z.object({
      conversationID: z.string(),
      model: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    // TODO: accessing cookie like this feels ugly, can you do better?
    const cookie = getCookie("better-auth.session_token");
    const res = await fetch(
      env.STREAM_URL + `/conversation/${data.conversationID}/stream`,
      {
        method: "POST",
        body: JSON.stringify({ model: data.model }),
        headers: {
          "Content-Type": "application/json",
          Cookie: `better-auth.session_token=${cookie}`,
        },
      },
    );
    if (!res.ok) {
      throw new Error("failed to start stream");
    }
    return res.json();
  });

export function Conversation(props: Props) {
  const { mutateAsync: createConversation } = useCreateConversation();
  const { mutateAsync: updateMessages } = useUpdateMessages();
  const navigate = useNavigate();
  const { conversationID } = useParams({ strict: false });
  const streamingContent =
    useConversationStore().conversation[conversationID!]?.content;
  const isNewConversation = !props.messages.length;

  async function onNewMessage(
    content: string,
    onError: (content: string) => void,
  ) {
    try {
      let cID = conversationID;
      if (isNewConversation) {
        cID = await createConversation(content);
      } else {
        await updateMessages({
          content,
          conversationID: cID!,
          role: "user",
        });
      }

      await startStream({
        data: {
          conversationID: cID!,
          model,
        },
      });

      if (isNewConversation) {
        navigate({
          to: "/conversation/$conversationID",
          params: { conversationID: cID! },
        });
      }
    } catch (err) {
      onError(content);
      console.error("failed to get response", err);
      toast.error("Failed to get response");
    }
  }

  return (
    <div
      className={cn("h-full px-4 pt-8 overflow-auto flex flex-col", {
        "items-center justify-center": isNewConversation,
      })}
    >
      {isNewConversation ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="max-w-2xl w-full flex flex-col items-center justify-center gap-3"
        >
          <p className="text-2xl sm:text-3xl font-semibold">
            How can I assist you today?
          </p>
          <ChatInput onNewMessage={onNewMessage} isNewConversation />
        </motion.div>
      ) : (
        <div className="w-full max-w-3xl mx-auto flex flex-col flex-1">
          <Messages
            messages={props.messages}
            streamingContent={streamingContent}
          />
          <ChatInput onNewMessage={onNewMessage} />
        </div>
      )}
    </div>
  );
}
