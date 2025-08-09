import type { Message } from "@llmchat/core/messsage/message";
import { cn } from "@/utils";
import { useEffect, useRef } from "react";
import { TypingIndicator } from "./TypingIndicator";
import { useConversationStore } from "@/utils/conversationStore";
import { Markdown } from "@/components/Markdown";

type MessagesProps = {
  conversationID: string;
  messages: Message.Entity[];
};

export function Messages(props: MessagesProps) {
  const { messages, conversationID } = props;

  const streamingContent =
    useConversationStore().conversation[conversationID]?.content;
  const streamingStatus =
    useConversationStore().conversation[conversationID]?.status;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messagesEndRef.current) {
      return;
    }
    messagesEndRef.current.scrollIntoView();
  }, [props.messages, streamingContent]);

  return (
    <div className="flex-1 flex flex-col gap-8 pb-10">
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

      <div ref={messagesEndRef} />
    </div>
  );
}
