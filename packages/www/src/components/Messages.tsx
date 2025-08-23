import type { Message as TMessage } from "@soonagi/core/messsage/message";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useConversationStore } from "@/stores/conversationStore";
import { Markdown } from "@/components/Markdown";
import { MessageActions } from "@/components/MessageActions";
import { useState } from "react";
import { EditMessage } from "./EditMessage";
import { Message } from "@/components/Message";

type MessagesProps = {
  conversationID: string;
  messages: TMessage.Entity[];
  widthRef: React.RefObject<HTMLDivElement | null>;
};

export function Messages(props: MessagesProps) {
  const { messages, conversationID } = props;

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

  return (
    <div className="flex-1 flex flex-col gap-8" ref={props.widthRef}>
      {messages.map((message) => {
        return (
          <div
            className={cn("flex flex-col group", {
              "self-end max-w-[80%]": message.role === "user",
              "w-full md:w-[70%]": editing?.id === message.id,
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

      {(streamingStatus === "waiting" ||
        (streamingStatus === "generating" && !hasContent)) && (
        <TypingIndicator />
      )}

      {hasContent && <Message content={streamingContent} role="assistant" />}
    </div>
  );
}
