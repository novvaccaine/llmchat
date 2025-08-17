import { Message } from "@soonagi/core/messsage/message";
import { CopyContent } from "@/components/CopyContent";
import { SquarePen as EditIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SetState } from "@/types";

type Props = {
  message: Message.Entity;
  setEditing: SetState<{ id: string; content: string } | null>;
};

export function MessageActions(props: Props) {
  const { message, setEditing } = props;
  return (
    <div
      className={cn(
        "mt-4 flex items-center gap-2.5 invisible transition-delay-[300ms] group-hover:visible",
        {
          "self-end": message.role === "user",
        },
      )}
    >
      {message.role === "user" && (
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
      )}

      <div className="flex items-center p-1.5 rounded-md hover:bg-bg-2">
        <CopyContent content={message.content} />
      </div>
    </div>
  );
}
