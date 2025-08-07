import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Sidebar } from "@/components/Sidebar";
import { conversationQueryOptions } from "@/utils/conversation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SidebarToggle } from "@/components/SidebarToggle";
import { useHotkeys } from "react-hotkeys-hook";
import { useUIStore } from "@/utils/uiStore";
import { DeleteConversation } from "@/components/DeleteConversation";
import { RenameConversation } from "@/components/RenameConversation";
import { motion } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMediaQuery } from "@uidotdev/usehooks";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

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
  const hasHydrated = useUIStore()._hasHydrated;

  if (!hasHydrated) {
    return null;
  }

  return <Content />;
}

function Content() {
  const { data: conversation } = useSuspenseQuery(conversationQueryOptions());
  const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  const toggleSidebar = useUIStore().toggleSidebar;
  const sidebarOpen = useUIStore().sidebarOpen;
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

  return (
    <>
      {!sidebarOpen && (
        <SidebarToggle className="fixed top-4 left-4 hover:bg-bg-2" />
      )}

      {dialog?.type === "delete_conversation" && (
        <DeleteConversation conversation={dialog.data} />
      )}

      {dialog?.type === "rename_conversation" && (
        <RenameConversation conversation={dialog.data} />
      )}

      <Dialog.Root
        open={sidebarOpen && isSmallDevice}
        onOpenChange={toggleSidebar}
      >
        <Dialog.Trigger className="hidden" />
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-bg/75" />
          <Dialog.Content className="fixed top-0 left-0 w-[270px] focus:outline-none h-full">
            <VisuallyHidden.Root>
              <Dialog.Title>
                Select Conversation or Create New Chat
              </Dialog.Title>
            </VisuallyHidden.Root>
            <Sidebar conversation={conversation} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="h-full grid grid-cols-1 md:grid-cols-[auto_1fr]">
        {!isSmallDevice && (
          <motion.div
            initial={false}
            animate={{ width: sidebarOpen ? 270 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="w-[270px] h-full">
              <Sidebar conversation={conversation} />
            </div>
          </motion.div>
        )}
        <Outlet />
      </div>
    </>
  );
}
