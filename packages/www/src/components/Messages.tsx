import React, { useEffect, useState } from "react";
import type { Message as TMessage } from "@soonagi/core/messsage/message";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useConversationStore } from "@/stores/conversationStore";
import { MessageActions } from "@/components/MessageActions";
import { EditMessage } from "./EditMessage";
import { Message } from "@/components/Message";

type MessagesProps = {
  conversationID: string;
  messages: TMessage.Entity[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
};

export function Messages(props: MessagesProps) {
  const { messages, conversationID, scrollRef } = props;

  // scroll whenever new user message arrives
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user" && scrollRef.current) {
      const element = scrollRef.current.querySelector(
        `[data-message-id="${lastMessage.id}"]`,
      );
      if (element instanceof HTMLDivElement) {
        scrollRef.current.scrollTop = element.offsetTop;
      }
    }
  }, [messages, scrollRef]);

  const [editing, setEditing] = useState<{
    id: string;
    content: string;
  } | null>(null);

  const streamingContent =
    useConversationStore().conversation[conversationID]?.content;
  const streamingStatus =
    useConversationStore().conversation[conversationID]?.status;

  const hasContent =
    streamingContent &&
    (streamingContent.text || streamingContent.steps?.length);

  const isStreaming =
    streamingStatus === "waiting" || streamingStatus === "generating";

  return (
    <div className="flex-1 flex flex-col gap-8 pb-7">
      {messages.map((message, i) => {
        return (
          <div
            className={cn("flex flex-col group", {
              "self-end max-w-[80%]": message.role === "user",
              "w-full md:w-[70%]": editing?.id === message.id,
              "min-h-[20rem]":
                i === messages.length - 1 &&
                message.role === "assistant" &&
                streamingStatus, // do not set height for conversation that's not involved in streaming yet
            })}
            data-message-id={message.id}
            key={message.id}
          >
            {editing?.id === message.id ? (
              <EditMessage
                message={message}
                conversationID={conversationID}
                editing={editing}
                setEditing={setEditing}
              />
            ) : (
              <Message content={message.content} role={message.role} />
            )}
            <MessageActions
              message={message}
              setEditing={setEditing}
              conversationID={conversationID}
            />
          </div>
        );
      })}

      {isStreaming && (
        <div className="min-h-[20rem]">
          {(streamingStatus === "waiting" ||
            (streamingStatus === "generating" && !hasContent)) && (
            <TypingIndicator />
          )}
          {hasContent && (
            <Message content={streamingContent} role="assistant" streaming />
          )}
        </div>
      )}
    </div>
  );
}

