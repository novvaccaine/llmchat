import { useUIStore } from "@/stores/uiStore";
import * as Dialog from "@radix-ui/react-dialog";
import { LoadingIcon } from "@/icons/LoadingIcon";
import { toast } from "sonner";
import { useLogin } from "@/query/auth";

export function LoginAlert() {
  const dialog = useUIStore().dialog;
  const setDialog = useUIStore().setDialog;
  const { mutateAsync: login, isPending } = useLogin();

  return (
    <Dialog.Root
      open={dialog?.type === "login_alert"}
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
            You're not logged in
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-muted">
            Hey, log in (you know the drill) to unlock the goodies!
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
              className="rounded-md bg-brand text-black px-4 py-1.5 focus:outline-none flex gap-2 items-center"
              onClick={async () => {
                try {
                  await login();
                  setDialog(null);
                } catch (err) {
                  console.error("failed to login", err);
                  toast.error("Failed to login");
                }
              }}
            >
              {isPending && (
                <LoadingIcon className="text-black/40 fill-black" />
              )}
              <span>Login</span>
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
