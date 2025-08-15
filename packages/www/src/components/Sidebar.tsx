import { splitConversationsByDate } from "@/lib/utils";
import { LogIn as LoginIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Route } from "@/routes/__root";
import { Conversation } from "@soonagi/core/conversation/conversation";
import { useMemo } from "react";
import { SidebarToggle } from "@/components/SidebarToggle";
import { useConversationStore } from "@/stores/conversationStore";
import { ConversationLink } from "@/components/ConversationLink";
import { useLogin } from "@/query/auth";
import { LoadingIcon } from "./LoadingIcon";

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
  const { mutateAsync: login, isPending } = useLogin();

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
          Soon AGI
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
            onClick={() => login()}
            className="flex gap-3 items-center hover:bg-bg w-full px-4 py-2 rounded-md"
          >
            <span>
              {isPending ? (
                <LoadingIcon className="text-white/40 fill-white" />
              ) : (
                <LoginIcon size={16} />
              )}
            </span>
            <span>Login</span>
          </button>
        )}
      </div>
    </div>
  );
}
