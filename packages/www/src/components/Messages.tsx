import type { Message } from "@soonagi/core/messsage/message";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@/components/TypingIndicator";
import { useConversationStore } from "@/stores/conversationStore";
import { Markdown } from "@/components/Markdown";
import { MessageActions } from "@/components/MessageActions";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useEditMessage } from "@/query/message";
import { useUIStore } from "@/stores/uiStore";

type MessagesProps = {
  conversationID: string;
  messages: Message.Entity[];
  widthRef: React.RefObject<HTMLDivElement | null>;
};

export function Messages(props: MessagesProps) {
  const { messages, conversationID } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editing, setEditing] = useState<{
    id: string;
    content: string;
  } | null>(null);

  const streamingContent =
    useConversationStore().conversation[conversationID]?.content;
  const streamingStatus =
    useConversationStore().conversation[conversationID]?.status;

  const model = useUIStore().selectedModel;
  const { mutateAsync: editMessageMutate } = useEditMessage();
  const requestGenerateContent = useConversationStore().requestGenerateContent;

  useEffect(() => {
    if (!editing || !textareaRef.current) {
      return;
    }
    textareaRef.current.focus();
  }, [editing]);

  async function editMessage(messageID: string) {
    if (!editing) {
      return;
    }
    const content = editing.content;
    if (!content.trim().length) {
      return;
    }
    try {
      await editMessageMutate({ content, conversationID, messageID, model });
      requestGenerateContent(conversationID);
    } catch (err) {
      console.error("failed to edit message", err);
      toast.error("Failed to edit message");
    }
  }

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
              <textarea
                ref={textareaRef}
                className="shadow-sidebar shadow-inner w-full resize-none focus:outline-none border border-border p-2 rounded-md"
                rows={3}
                placeholder="Edit message"
                value={editing.content}
                onChange={(e) =>
                  setEditing((prev) =>
                    !prev ? null : { ...prev, content: e.target.value },
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    editMessage(message.id);
                  }
                }}
              />
            ) : (
              <div
                className={cn({
                  "border border-border rounded-md bg-bg-2 p-2":
                    message.role === "user",
                })}
              >
                <Markdown className="prose prose-soonagi max-w-none">
                  {message.content}
                </Markdown>
              </div>
            )}
            <MessageActions message={message} setEditing={setEditing} />
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
