import { Message } from "@soonagi/core/messsage/message";
import { CopyContent } from "@/components/CopyContent";
import { SquarePen as EditIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SetState } from "@/types";
import { Tooltip } from "@/components/Tooltip";
import { MessageActionPicker } from "./MessageActionPicker";
import { Model } from "@soonagi/core/model";

type Props = {
  conversationID: string;
  message: Message.Entity;
  setEditing: SetState<{ id: string; content: string } | null>;
};

export function MessageActions(props: Props) {
  const { message, setEditing } = props;
  const messageModel = message.model
    ? Model.modelOptions().find((m) => m.value === message.model)
    : null;

  return (
    <div
      className={cn(
        "mt-4 flex items-center gap-2.5 invisible transition-delay-[300ms] group-hover:visible",
        {
          "self-end flex-row-reverse": message.role === "user",
        },
      )}
    >
      <Tooltip content="Copy Message">
        <div className="flex items-center p-1.5 rounded-md hover:bg-bg-2">
          <CopyContent content={message.content} />
        </div>
      </Tooltip>

      {message.role === "user" && (
        <Tooltip content="Edit Message">
          <button
            className="flex items-center p-1.5 rounded-md hover:bg-bg-2"
            onClick={() =>
              setEditing((prev) =>
                prev?.id === message.id
                  ? null
                  : { id: message.id, content: message.content },
              )
            }
          >
            <EditIcon size={16} />
          </button>
        </Tooltip>
      )}

      <MessageActionPicker
        action="retry"
        messageID={message.id}
        conversationID={props.conversationID}
        messageRole={message.role}
      />

      <MessageActionPicker
        action="branchOff"
        messageID={message.id}
        conversationID={props.conversationID}
        messageRole={message.role}
      />

      {messageModel && (
        <p className="text-muted text-sm font-medium">{messageModel.label}</p>
      )}
    </div>
  );
}
