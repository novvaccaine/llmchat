import { useEffect, useRef } from "react";
import { Message } from "@soonagi/core/messsage/message";
import { SetState } from "@/types";
import { useEditMessage } from "@/query/message";
import { useUIStore } from "@/stores/uiStore";
import { useConversationStore } from "@/stores/conversationStore";
import { toast } from "sonner";

type Editing = { id: string; content: string };

type Props = {
  message: Message.Entity;
  conversationID: string;
  editing: Editing | null;
  setEditing: SetState<Editing | null>;
};

export function EditMessage(props: Props) {
  const { editing, setEditing, message, conversationID } = props;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const requestGenerateContent = useConversationStore().requestGenerateContent;
  const { mutateAsync: editMessageMutate } = useEditMessage();
  const model = useUIStore().selectedModel;

  async function editMessage() {
    if (!editing) {
      return;
    }
    const content = editing.content;
    if (!content.trim().length) {
      return;
    }
    try {
      await editMessageMutate({
        content,
        conversationID,
        messageID: message.id,
        model,
      });
      requestGenerateContent(conversationID);
    } catch (err) {
      console.error("failed to edit message", err);
      toast.error("Failed to edit message");
    }
  }

  useEffect(() => {
    if (!editing || !textareaRef.current) {
      return;
    }
    textareaRef.current.focus();
  }, [editing]);

  return (
    <textarea
      ref={textareaRef}
      className="shadow-sidebar shadow-inner w-full resize-none focus:outline-none border border-border p-2 rounded-md"
      rows={3}
      placeholder="Edit message"
      value={editing?.content}
      onChange={(e) =>
        setEditing((prev) =>
          !prev ? null : { ...prev, content: e.target.value },
        )
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          editMessage();
        }
      }}
    />
  );
}
