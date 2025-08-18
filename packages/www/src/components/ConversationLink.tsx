import { Link, useNavigate } from "@tanstack/react-router";
import { Conversation } from "@soonagi/core/conversation/conversation";
import { LoadingIcon } from "@/icons/LoadingIcon";
import { EllipsisVertical as OptionsIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useHover } from "@uidotdev/usehooks";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { memo, useState } from "react";
import { Trash2 as DeleteIcon, SquarePen as EditIcon } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { Tooltip } from "@/components/Tooltip";
import { Split as BranchOffIcon } from "lucide-react";

type Props = {
  conversation: Conversation.Entity;
  generating: boolean;
};

export function Component(props: Props) {
  const { conversation, generating } = props;
  const [ref, hovering] = useHover();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <Link
      ref={ref}
      className="hover:bg-bg px-4 py-2 rounded-md flex gap-4 items-center"
      to="/conversation/$conversationID"
      params={{ conversationID: conversation.id }}
      activeProps={{ className: "bg-bg" }}
    >
      <Tooltip content={conversation.title!}>
        <div className="flex gap-2.5 items-center min-w-0">
          {conversation.branchedFrom && (
            <button
              className="text-muted hover:text-brand shrink-0"
              onClick={(e) => {
                e.preventDefault();
                navigate({
                  to: "/conversation/$conversationID",
                  params: { conversationID: conversation.branchedFrom?.id! },
                });
              }}
            >
              <BranchOffIcon size={16} />
            </button>
          )}
          <p className="truncate">{conversation.title}</p>
        </div>
      </Tooltip>
      {generating && (
        <LoadingIcon className="shrink-0 text-brand/40 fill-white ml-auto" />
      )}
      <AnimatePresence>
        {(hovering || open) && !generating && (
          <ConversationOptions setOpen={setOpen} conversation={conversation} />
        )}
      </AnimatePresence>
    </Link>
  );
}

type ConversationOptionsProps = {
  setOpen: (open: boolean) => void;
  conversation: Conversation.Entity;
};

function ConversationOptions(props: ConversationOptionsProps) {
  const setDialog = useUIStore().setDialog;

  return (
    <DropdownMenu.Root onOpenChange={props.setOpen}>
      <DropdownMenu.Trigger asChild>
        <motion.button
          initial={{ x: 10 }}
          animate={{ x: 0 }}
          transition={{
            duration: 0.1,
            ease: "easeInOut",
          }}
          className="shrink-0 ml-auto p-1 hover:bg-bg-2 rounded-md"
        >
          <OptionsIcon size={16} />
        </motion.button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="bg-bg border border-border p-3 px-2 rounded-md flex flex-col gap-2">
          <DropdownMenu.Item
            className="flex gap-3 px-2 py-1 rounded-md items-center data-highlighted:outline-none data-highlighted:bg-bg-2 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDialog({
                type: "rename_conversation",
                data: props.conversation,
              });
            }}
          >
            <EditIcon size={16} />
            <span>Rename</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex gap-3 px-2 py-1 rounded-md items-center data-highlighted:outline-none data-highlighted:bg-danger/5 cursor-pointer text-danger"
            onClick={(e) => {
              e.stopPropagation();
              setDialog({
                type: "delete_conversation",
                data: props.conversation,
              });
            }}
          >
            <DeleteIcon size={16} />
            <span>Delete</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export const ConversationLink = memo(Component);
