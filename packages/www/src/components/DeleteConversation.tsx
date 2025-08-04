import { useUIStore } from "@/utils/uiStore";
import { Conversation } from "@llmchat/core/conversation/conversation";
import * as Dialog from "@radix-ui/react-dialog";
import { LoadingIcon } from "@/components/LoadingIcon";
import { useDeleteConveration } from "@/utils/conversation";
import { toast } from "sonner";
import { useRouter } from "@tanstack/react-router";

type Props = {
  conversation: Conversation.Entity;
};

export function DeleteConversation(props: Props) {
  const { conversation } = props;
  const dialog = useUIStore().dialog;
  const setDialog = useUIStore().setDialog;
  const { mutateAsync: deleteConversation, isPending } = useDeleteConveration();
  const router = useRouter();

  return (
    <Dialog.Root
      open={dialog?.type === "delete_conversation"}
      onOpenChange={(open) => {
        if (!open) {
          setDialog(null);
        }
      }}
    >
      <Dialog.Trigger className="hidden" />
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-bg/75" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-full rounded-md bg-sidebar p-4 -translate-x-1/2 -translate-y-1/2 border border-bg-2 focus:outline-none">
          <Dialog.Title className="text-lg font-semibold">
            Delete Conversation
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-muted">
            <span>Are you sure you want to delete "{conversation.title}"</span>
            <span>This action cannot be undone.</span>
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-4">
            <button
              className="rounded-md bg-bg-2 px-4 py-1.5 focus:outline-none"
              onClick={() => setDialog(null)}
            >
              Cancel
            </button>
            <button
              disabled={isPending}
              className="rounded-md bg-danger text-white px-4 py-1.5 focus:outline-none flex gap-2 items-center"
              onClick={async () => {
                try {
                  await deleteConversation(conversation.id);
                  setDialog(null);
                  router.invalidate();
                } catch (err) {
                  console.error("failed to delete conversation", err);
                  toast.error("Failed to delete conversation");
                }
              }}
            >
              {isPending && (
                <LoadingIcon className="text-white/40 fill-white" />
              )}
              <span>Delete</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
