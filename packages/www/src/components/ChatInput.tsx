import { cn } from "@/lib/utils";
import { useConversationStore } from "@/stores/conversationStore";
import { useUIStore } from "@/stores/uiStore";
import { useRouteContext } from "@tanstack/react-router";
import React, { useEffect, useRef, useState } from "react";
import { Globe as WebIcon } from "lucide-react";
import { ModelPicker } from "./ModelPicker";

type ChatInputProps = {
  onNewMessage: (content: string, onError: (content: string) => void) => void;
  conversationID?: string;
  className?: string;
  width?: number;
};

export function ChatInput(props: ChatInputProps) {
  const user = useRouteContext({ from: "__root__" }).user;
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const status =
    useConversationStore().conversation[props.conversationID!]?.status;
  const setDialog = useUIStore().setDialog;
  const toggleWebSearch = useUIStore().toggleWebSearch;
  const webSearch = useUIStore().webSearch;

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
  if (props.width) {
    style.width = props.width;
  }

  return (
    <div
      style={style}
      className={cn(
        "bg-bg-2/80 backdrop-blur-lg border border-border p-2",
        props.className ?? "",
      )}
    >
      <textarea
        className="w-full resize-none focus:outline-none"
        ref={textareaRef}
        rows={3}
        placeholder="Type your message here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center gap-2">
        <ModelPicker />
        <button
          onClick={toggleWebSearch}
          className={cn(
            "flex gap-2 items-center px-3 py-1 rounded-full border border-border transition-background duration-150",
            {
              "bg-brand-tint border-brand-tint": webSearch,
            },
          )}
        >
          <WebIcon size={16} />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
}
