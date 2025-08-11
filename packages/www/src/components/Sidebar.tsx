import { authClient, splitConversationsByDate } from "@/lib/utils";
import { LogIn as LoginIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Route } from "@/routes/__root";
import { Conversation } from "@llmchat/core/conversation/conversation";
import * as Tooltip from "@radix-ui/react-tooltip";
import { LoadingIcon } from "./LoadingIcon";
import { EllipsisVertical as OptionsIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useHover } from "@uidotdev/usehooks";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMemo, useState } from "react";
import { Trash2 as DeleteIcon, SquarePen as EditIcon } from "lucide-react";
import { useUIStore } from "@/stores/uiStore";
import { SidebarToggle } from "@/components/SidebarToggle";
import { useConversationStore } from "@/stores/conversationStore";

type Props = {
  conversation: Conversation.Entity[];
};

const indexDateMap = {
  0: "Today",
  1: "Yesterday",
  2: "Last 7 days",
  3: "Last 30 days",
};

export function Sidebar(props: Props) {
  const user = Route.useRouteContext().user;
  const conversationStore = useConversationStore().conversation;

  const signIn = async () => {
    await authClient.signIn.social({
      provider: "google",
    });
  };

  const conversation = useMemo(() => {
    return splitConversationsByDate(props.conversation);
  }, [props.conversation]);

  return (
    <div className="h-full bg-sidebar p-4 flex flex-col">
      <div className="flex items-center">
        <SidebarToggle className="shrink-0 hover:bg-bg-2" />
        <Link
          className="flex-1 text-center text-lg font-semibold text-center"
          to="/"
        >
          LLM Chat
        </Link>
      </div>

      <Link
        to="/"
        className="mt-4 bg-brand text-black px-4 py-2 rounded-md text-center"
      >
        New Chat
      </Link>

      <div className="mt-6 mb-2 flex-1 overflow-auto hide-scrollbar">
        {conversation.map((item, i) => {
          if (!item.length) {
            return null;
          }
          return (
            <div key={i} className="mb-4">
              <p className="text-muted mb-2">{indexDateMap[i]}</p>
              <div className="flex flex-col gap-0.5">
                {item.map((c) => {
                  const entry = conversationStore[c.id];
                  const title = entry?.title ?? c.title ?? "Untitled";
                  return (
                    <ConversationLink
                      key={c.id}
                      conversation={{ ...c, title }}
                      generating={
                        entry &&
                        (entry.status === "generating" ||
                          entry.status === "waiting")
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto">
        {user ? (
          <Link
            to="/settings"
            className="px-3 py-2 rounded-md flex gap-3 items-center hover:bg-bg"
          >
            <img
              className="size-8 rounded-full"
              src={user.image!}
              alt="avatar"
              referrerPolicy="no-referrer"
            />
            <span>{user.name}</span>
          </Link>
        ) : (
          <button
            onClick={signIn}
            className="flex gap-3 items-center hover:bg-bg w-full px-4 py-2 rounded-md"
          >
            <span>
              <LoginIcon size={16} />
            </span>
            <span>Login</span>
          </button>
        )}
      </div>
    </div>
  );
}

type ConversationProps = {
  conversation: Conversation.Entity;
  generating: boolean;
};

function ConversationLink(props: ConversationProps) {
  const { conversation, generating } = props;
  const [ref, hovering] = useHover();
  const [open, setOpen] = useState(false);

  return (
    <Link
      ref={ref}
      className="hover:bg-bg px-4 py-2 rounded-md flex gap-4 items-center"
      to="/conversation/$conversationID"
      params={{ conversationID: conversation.id }}
      activeProps={{ className: "bg-bg" }}
    >
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span className="truncate">{conversation.title}</span>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              className="bg-bg px-2 py-1 rounded-md border border-border max-w-[320px]"
              side="bottom"
            >
              {conversation.title}
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
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
