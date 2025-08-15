import { useUIStore } from "@/stores/uiStore";
import { Conversation } from "@soonagi/core/conversation/conversation";
import * as Dialog from "@radix-ui/react-dialog";
import { LoadingIcon } from "@/components/LoadingIcon";
import { useUpdateConversation } from "@/query/conversation";
import { toast } from "sonner";
import { useConversationStore } from "@/stores/conversationStore";

type Props = {
  conversation: Conversation.Entity;
};

export function RenameConversation(props: Props) {
  const { conversation } = props;
  const dialog = useUIStore().dialog;
  const setDialog = useUIStore().setDialog;
  const rename = useConversationStore().rename;
  const { mutateAsync: updateConversation, isPending } =
    useUpdateConversation();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const conversationTitle = formData.get("conversationTitle");
    if (!conversationTitle) {
      return;
    }
    const title = conversationTitle.toString();
    if (!title.trim().length) {
      return;
    }

    try {
      await updateConversation({ conversationID: conversation.id, title });
      setDialog(null);
      rename(conversation.id, title);
    } catch (err) {
      console.error("failed to update conversation title", err);
      toast.error("Failed to update conversation title");
    }
  }

  return (
    <Dialog.Root
      open={dialog?.type === "rename_conversation"}
      onOpenChange={(open) => {
        if (!open) {
          setDialog(null);
        }
      }}
    >
      <Dialog.Trigger className="hidden" />
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-bg/75" />
        <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-[95%] rounded-md bg-sidebar p-4 -translate-x-1/2 -translate-y-1/2 border border-bg-2 focus:outline-none">
          <Dialog.Title className="text-lg font-semibold">
            Rename Conversation
          </Dialog.Title>
          <form className="mt-4 flex flex-col" onSubmit={onSubmit}>
            <input
              autoComplete="off"
              name="conversationTitle"
              id="conversationTitle"
              className="w-full bg-bg-2 p-2 rounded-md focus:outline-none"
              placeholder="Enter title"
              type="text"
              defaultValue={props.conversation.title}
            />
            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                className="rounded-md bg-bg-2 px-4 py-1.5 focus:outline-none"
                onClick={() => setDialog(null)}
              >
                Cancel
              </button>
              <button
                disabled={isPending}
                className="rounded-md bg-brand text-black px-4 py-1.5 focus:outline-none flex gap-2 items-center"
              >
                {isPending && (
                  <LoadingIcon className="text-black/40 fill-black" />
                )}
                <span>Save</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
