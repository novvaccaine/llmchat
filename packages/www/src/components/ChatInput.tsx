import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/conversationStore";
import { useUIStore } from "@/stores/uiStore";
import { useRouteContext } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";

type ChatInputProps = {
  onNewMessage: (content: string, onError: (content: string) => void) => void;
  conversationID?: string;
  className?: string;
  width?: number;
};

const SMALL_DEVICE_BREAKPOINT = 640;

export function ChatInput(props: ChatInputProps) {
  const user = useRouteContext({ from: "__root__" }).user;
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const status =
    useConversationStore().conversation[props.conversationID!]?.status;
  const setDialog = useUIStore().setDialog;

  async function handleSubmit() {
    if (!user) {
      setDialog({ type: "login_alert" });
      return;
    }

    const input = content.trim();
    if (
      !input.length ||
      (status && (status === "generating" || status === "waiting"))
    ) {
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

  const style: React.CSSProperties = {};
  if (props.width && props.width > SMALL_DEVICE_BREAKPOINT) {
    style.width = props.width;
  }

  return (
    <textarea
      ref={textareaRef}
      style={style}
      className={cn(
        "bg-bg-2/80 backdrop-blur-lg border border-border p-2 resize-none focus:outline-none",
        props.className ?? "",
        {
          "fixed bottom-0 left-0 w-full rounded-t-2xl":
            props.width && props.width < SMALL_DEVICE_BREAKPOINT,
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
