import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Sidebar } from "@/components/Sidebar";
import { conversationQueryOptions } from "@/utils/conversation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SidebarToggle } from "@/components/SidebarToggle";
import { useHotkeys } from "react-hotkeys-hook";
import { cn } from "@/utils";
import { useUIStore } from "@/utils/uiStore";
import { DeleteConversation } from "@/components/DeleteConversation";
import { RenameConversation } from "@/components/RenameConversation";

const hotKeysOptions = {
  preventDefault: true,
  enableOnFormTags: true,
};

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.user) {
      return [];
    }
    return context.queryClient.fetchQuery(conversationQueryOptions());
  },
});

function RouteComponent() {
  const { data: conversation } = useSuspenseQuery(conversationQueryOptions());
  const toggleSidebar = useUIStore().toggleSidebar;
  const sidebarOpen = useUIStore().sidebarOpen;
  const hasHydrated = useUIStore()._hasHydrated;
  const navigate = useNavigate();
  const dialog = useUIStore().dialog;

  useHotkeys("ctrl+b", toggleSidebar, hotKeysOptions, []);

  useHotkeys(
    "ctrl+shift+o",
    () => {
      navigate({ to: "/" });
    },
    hotKeysOptions,
    [],
  );

  if (!hasHydrated) {
    return null;
  }

  return (
    <>
      <SidebarToggle />

      {dialog?.type === "delete_conversation" && (
        <DeleteConversation conversation={dialog.data} />
      )}

      {dialog?.type === "rename_conversation" && (
        <RenameConversation conversation={dialog.data} />
      )}

      <div
        className={cn("h-full grid grid-cols-[270px_1fr]", {
          "grid-cols-1": !sidebarOpen,
        })}
      >
        {sidebarOpen && <Sidebar conversation={conversation} />}
        <Outlet />
      </div>
    </>
  );
}
