import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Sidebar } from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { MEDIUM_DEVICE_QUERY, SidebarToggle } from "@/components/SidebarToggle";
import { useHotkeys } from "react-hotkeys-hook";
import { useUIStore } from "@/stores/uiStore";
import { DeleteConversation } from "@/components/DeleteConversation";
import { RenameConversation } from "@/components/RenameConversation";
import { LoginAlert } from "@/components/LoginAlert";
import { motion, AnimatePresence } from "motion/react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMediaQuery } from "@uidotdev/usehooks";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { conversationQueryOptions } from "@/query/conversation";

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
    return context.queryClient.ensureQueryData(conversationQueryOptions(true));
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
  const user = Route.useRouteContext().user;
  const { data: conversation } = useQuery(
    conversationQueryOptions(Boolean(user)),
  );
  const isMediumSizedDevice = useMediaQuery(MEDIUM_DEVICE_QUERY);
  const toggleSidebar = useUIStore().toggleSidebar;
  const toggleDrawerSidebar = useUIStore().toggleDrawerSidebar;
  const sidebarOpen = useUIStore().sidebarOpen;
  const sidebarDrawerOpen = useUIStore().sidebarDrawerOpen;
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
      {(!sidebarOpen || !sidebarDrawerOpen) && (
        <div className="fixed p-[2px] rounded-md bg-sidebar/20 top-[14px] left-[14px] backdrop-blur-sm z-[1]">
          <SidebarToggle className="hover:bg-bg-2" />
        </div>
      )}

      {dialog?.type === "delete_conversation" && (
        <DeleteConversation conversation={dialog.data} />
      )}

      {dialog?.type === "rename_conversation" && (
        <RenameConversation conversation={dialog.data} />
      )}

      {dialog?.type === "login_alert" && <LoginAlert />}

      <Dialog.Root
        open={sidebarDrawerOpen && isMediumSizedDevice}
        onOpenChange={toggleDrawerSidebar}
      >
        <Dialog.Trigger className="hidden" />
        <AnimatePresence initial={false}>
          {sidebarDrawerOpen && isMediumSizedDevice && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-bg/75" />
              <Dialog.Content asChild>
                <motion.div
                  className="fixed top-0 left-0 w-[270px] focus:outline-none h-full"
                  initial={{ x: -270 }}
                  animate={{ x: 0 }}
                  exit={{ x: -270 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <VisuallyHidden.Root>
                    <Dialog.Title>
                      Select Conversation or Create New Chat
                    </Dialog.Title>
                  </VisuallyHidden.Root>
                  <Sidebar conversation={conversation ?? []} />
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>

      <div className="h-full grid grid-cols-1 md:grid-cols-[auto_1fr]">
        {!isMediumSizedDevice && (
          <motion.div
            initial={false}
            animate={{ width: sidebarOpen ? 270 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="w-[270px] h-full">
              <Sidebar conversation={conversation ?? []} />
            </div>
          </motion.div>
        )}
        <Outlet />
      </div>
    </>
  );
}
