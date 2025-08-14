import type { Message } from "@llmchat/core/messsage/message";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useConversationStore } from "@/stores/conversationStore";
import { Markdown } from "@/components/Markdown";

type MessagesProps = {
  conversationID: string;
  messages: Message.Entity[];
  widthRef: React.RefObject<HTMLDivElement | null>;
};

export function Messages(props: MessagesProps) {
  const { messages, conversationID } = props;

  const streamingContent =
    useConversationStore().conversation[conversationID]?.content;
  const streamingStatus =
    useConversationStore().conversation[conversationID]?.status;

  return (
    <div className="flex-1 flex flex-col gap-8" ref={props.widthRef}>
      {messages.map((message) => {
        return (
          <div
            data-message-id={message.id}
            key={message.id}
            className={cn({
              "self-end border border-border rounded-md bg-bg-2 max-w-[80%] p-2":
                message.role === "user",
            })}
          >
            <Markdown className="prose prose-llmchat max-w-none">
              {message.content}
            </Markdown>
          </div>
        );
      })}

      {streamingStatus === "waiting" && <TypingIndicator />}

      {streamingContent && (
        <Markdown className="prose prose-llmchat max-w-none">
          {streamingContent}
        </Markdown>
      )}
    </div>
  );
}
