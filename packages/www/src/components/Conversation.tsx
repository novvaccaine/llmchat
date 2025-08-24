import { Messages } from "@/components/Messages";
import { ChatInput } from "@/components/ChatInput";
import type { Message } from "@soonagi/core/messsage/message";
import { useCreateConversation } from "@/query/conversation";
import { useUpdateMessages } from "@/query/message";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { Logo } from "@/icons/Logo";
import { useConversationStore } from "@/stores/conversationStore";
import { useUIStore } from "@/stores/uiStore";
import { useAutoScroll } from "@/hooks/useAutoScroll";

type Props = {
  messages: Message.Entity[];
  conversationID?: string;
};

export function Conversation(props: Props) {
  const { messages, conversationID } = props;
  const { mutateAsync: createConversation } = useCreateConversation();
  const { mutateAsync: updateMessages } = useUpdateMessages();
  const navigate = useNavigate();
  const requestGenerateContent = useConversationStore().requestGenerateContent;
  const model = useUIStore().selectedModel;
  const webSearch = useUIStore().webSearch;

  async function onNewMessage(
    content: string,
    onError: (content: string) => void,
  ) {
    try {
      let cID = conversationID;
      if (!conversationID) {
        const res = await createConversation({ content, model, webSearch });
        cID = res.conversationID;
      } else {
        await updateMessages({
          content,
          conversationID: cID!,
          model,
          webSearch,
        });
      }

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

  const streamingContent =
    useConversationStore().conversation[conversationID!]?.content;

  const {
    ref: messagesRef,
    isAtBottom,
    scrollToBottom,
  } = useAutoScroll([messages, streamingContent]);

  return (
    <div
      ref={messagesRef}
      className={cn("h-full overflow-auto flex flex-col", {
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
            isAtBottom={isAtBottom}
            scrollToBottom={scrollToBottom}
            className="sticky bottom-0 rounded-md w-full mx-2"
          />
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 pt-8">
          <Messages messages={messages} conversationID={conversationID!} />
          <ChatInput
            onNewMessage={onNewMessage}
            conversationID={conversationID}
            className="sticky bottom-0 rounded-t-md sm:border-b-0"
            isAtBottom={isAtBottom}
            scrollToBottom={scrollToBottom}
          />
        </div>
      )}
    </div>
  );
}
