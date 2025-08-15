import { Messages } from "@/components/Messages";
import { ChatInput } from "@/components/ChatInput";
import type { Message } from "@soonagi/core/messsage/message";
import { useCreateConversation } from "@/query/conversation";
import { useUpdateMessages } from "@/query/message";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Logo } from "@/components/Logo";
import { useConversationStore } from "@/stores/conversationStore";
import {
  ChatContainerRoot,
  ChatContainerContent,
} from "@/components/ChatContainer";
import useWidth from "@/lib/useWidth";
import { ScrollToBottom } from "@/components/ScrollToBottom";
import { actor } from "@/lib/Actor";

type Props = {
  messages: Message.Entity[];
  conversationID?: string;
};

const model = "openai/gpt-4.1-mini";

export function Conversation(props: Props) {
  const { messages, conversationID } = props;
  const { mutateAsync: createConversation } = useCreateConversation();
  const { mutateAsync: updateMessages } = useUpdateMessages();
  const navigate = useNavigate();
  const requestGenerateContent = useConversationStore().requestGenerateContent;
  const [widthRef, width] = useWidth();

  async function onNewMessage(
    content: string,
    onError: (content: string) => void,
  ) {
    try {
      let cID = conversationID;
      if (!conversationID) {
        const res = await createConversation({ content });
        cID = res.conversationID;
      } else {
        await updateMessages({
          content,
          conversationID: cID!,
        });
      }

      // NOTE: welp
      (
        actor.conn as { generateContent: (...args: any) => void }
      ).generateContent({ conversationID: cID, model });

      requestGenerateContent(cID!);

      if (!conversationID) {
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
    <ChatContainerRoot
      className={cn("h-full overflow-auto flex flex-col relative", {
        "items-center justify-center": !conversationID,
      })}
    >
      {!conversationID ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="max-w-2xl w-full flex flex-col items-center gap-3 px-4"
        >
          <Logo className="size-10 fill-brand" />
          <p className="text-2xl sm:text-3xl font-semibold">
            How can I assist you today?
          </p>
          <ChatInput
            onNewMessage={onNewMessage}
            className="sticky bottom-0 rounded-md w-full mx-2"
          />
        </motion.div>
      ) : (
        <ChatContainerContent className="w-full max-w-3xl mx-auto px-4 pt-8 mb-[165px]">
          <Messages
            messages={messages}
            conversationID={conversationID!}
            widthRef={widthRef}
          />
          <ChatInput
            onNewMessage={onNewMessage}
            conversationID={conversationID}
            width={width}
            className="fixed bottom-0 rounded-t-md"
          />
          {/* NOTE: magic 125px value (ChatInput height) */}
          <div className="absolute bottom-[125px] left-1/2 -translate-x-[50%]">
            <ScrollToBottom />
          </div>
        </ChatContainerContent>
      )}
    </ChatContainerRoot>
  );
}
