import { cn } from "@/utils";
import { useConversationStore } from "@/utils/conversationStore";
import React, { useEffect, useRef, useState } from "react";

type ChatInputProps = {
  onNewMessage: (content: string, onError: (content: string) => void) => void;
  isNewConversation?: boolean;
  conversationID?: string;
};

export function ChatInput(props: ChatInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const status =
    useConversationStore().conversation[props.conversationID!]?.status;

  async function handleSubmit() {
    const input = content.trim();
    if (!input.length || (status && status !== "generated")) {
      return;
    }
    setContent("");
    props.onNewMessage(input, (content) => setContent(content));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.focus();
  }, [props.conversationID]);

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        "bg-bg-2/80 backdrop-blur-lg sticky bottom-0 rounded-t-md border border-border w-full p-2 resize-none focus:outline-none",
        {
          "rounded-md": props.isNewConversation,
        },
      )}
      rows={4}
      placeholder="Type your message here..."
      value={content}
      onChange={(e) => setContent(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
}
