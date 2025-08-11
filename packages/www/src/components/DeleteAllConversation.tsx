import * as Dialog from "@radix-ui/react-dialog";
import { LoadingIcon } from "@/components/LoadingIcon";
import { useDeleteAllConveration } from "@/query/conversation";
import { toast } from "sonner";
import { useState } from "react";
import { Trash2 as DeleteIcon } from "lucide-react";

export function DeleteAllConversation() {
  const { mutateAsync: deleteAllConversation, isPending } =
    useDeleteAllConveration();
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="rounded-md bg-danger text-white px-4 py-2 focus:outline-none flex gap-2 items-center">
        <DeleteIcon size={16} />
        <span>Delete Chat History</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-bg/75" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-[95%] rounded-md bg-sidebar p-4 -translate-x-1/2 -translate-y-1/2 border border-bg-2 focus:outline-none">
          <Dialog.Title className="text-lg font-semibold">
            Are you absolutely sure?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-muted">
            This will permanently delete all your chat history. This action
            cannot be undone.
          </Dialog.Description>
          <div className="mt-6 flex justify-end gap-4">
            <button
              className="rounded-md bg-bg-2 px-4 py-1.5 focus:outline-none"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <button
              disabled={isPending}
              className="rounded-md bg-danger text-white px-4 py-1.5 focus:outline-none flex gap-2 items-center"
              onClick={async () => {
                try {
                  await deleteAllConversation({});
                  toast.success("Deleted chat history");
                  setOpen(false);
                } catch (err) {
                  console.error("failed to delete chat history", err);
                  toast.error("Failed to delete chat history");
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
