import type { Message } from "@soonagi/core/messsage/message";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useConversationStore } from "@/stores/conversationStore";
import { Markdown } from "@/components/Markdown";
import { MessageActions } from "@/components/MessageActions";
import { useState } from "react";
import { EditMessage } from "./EditMessage";

type MessagesProps = {
  conversationID: string;
  messages: Message.Entity[];
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
              <div
                className={cn({
                  "max-w-full self-end border border-border rounded-md bg-bg-2 p-2":
                    message.role === "user",
                })}
              >
                <Markdown className="prose prose-soonagi max-w-none">
                  {message.content}
                </Markdown>
              </div>
            )}
            <MessageActions
              message={message}
              setEditing={setEditing}
              conversationID={conversationID}
            />
          </div>
        );
      })}

      {streamingStatus === "waiting" && <TypingIndicator />}

      {streamingContent && (
        <Markdown className="prose prose-soonagi max-w-none">
          {streamingContent}
        </Markdown>
      )}
    </div>
  );
}
