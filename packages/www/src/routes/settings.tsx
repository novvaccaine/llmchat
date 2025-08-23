import { authClient } from "@/lib/utils";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft as LeftIcon, Key as KeyIcon } from "lucide-react";
import { providersQueryOptions, useUpdateProvider } from "@/query/provider";
import { LoadingIcon } from "@/icons/LoadingIcon";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DeleteAllConversation } from "@/components/DeleteAllConversation";
import * as Switch from "@radix-ui/react-switch";
import { useUIStore } from "@/stores/uiStore";
import { Model } from "@soonagi/core/model";
import { orpc } from "@/orpc/client";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData(providersQueryOptions());
  },
});

function RouteComponent() {
  const router = useRouter();
  const { data: providers } = useSuspenseQuery(providersQueryOptions());
  const provider = providers.find((p) => p.provider === "openrouter");
  const setModel = useUIStore().selectModel;
  const { queryClient } = Route.useRouteContext();

  const user = Route.useRouteContext().user!;
  const image = user.image!.replace(/=.+$/, "");

  const { mutateAsync: updateProvider, isPending } = useUpdateProvider();

  function signOut() {
    authClient.signOut(
      {},
      {
        onSuccess: () => {
          setModel(Model.DEFAULT_MODEL);
          queryClient.removeQueries({
            queryKey: ["authUser"],
          });
          queryClient.removeQueries({
            queryKey: orpc.conversation.list.queryKey(),
          });
          router.invalidate();
        },
      },
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const apiKeyValue = formData.get("openrouterAPIKey");
    if (!apiKeyValue) {
      return;
    }
    const apiKey = String(apiKeyValue).trim();
    if (!apiKey.length) {
      return;
    }

    const enableValue = formData.get("openrouterEnable");

    const input = {
      apiKey,
      provider: "openrouter",
      enabled: enableValue === "on",
    } as const;

    try {
      await updateProvider(input);
      toast.success("API key updated");
      if (!input.enabled) {
        setModel(Model.DEFAULT_MODEL);
      }
      queryClient.invalidateQueries({
        queryKey: ["authUser"],
      });
    } catch (err) {
      console.error("failed to update api key", err);
      toast.error("Failed to update API key");
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex gap-2 items-center hover:bg-bg-2 px-4 py-2 rounded-md"
        >
          <LeftIcon size={18} />
          <span>Back to home</span>
        </Link>
        <button
          className="flex gap-3 items-center hover:bg-bg-2 px-4 py-2 rounded-md"
          onClick={signOut}
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] mt-8 gap-12">
        <div className="flex flex-col items-center gap-4">
          <img
            className="size-[160px] rounded-full"
            src={image}
            alt="avatar"
            referrerPolicy="no-referrer"
          />
          <p className="font-semibold text-xl">{user.name}</p>
        </div>

        <div>
          <div className="mb-7.5">
            <p className="text-xl font-semibold mb-2.5">API Keys</p>
            <div className="border border-border p-4 rounded-md">
              <form className="flex flex-col" onSubmit={onSubmit}>
                <div className="flex items-center justify-between flex-wrap gap-4 my-2">
                  <p className="flex items-center gap-2.5">
                    <KeyIcon size={16} />
                    <span>OpenRouter API Key</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <label htmlFor="openrouterEnable">Enable</label>
                    <Switch.Root
                      defaultChecked={provider?.enabled ?? false}
                      className="relative w-[42px] h-[20px] rounded-full bg-muted/20 outline-none data-[state=checked]:bg-brand"
                      id="openrouterEnable"
                      name="openrouterEnable"
                    >
                      <Switch.Thumb className="block size-[15px] translate-x-0.5 rounded-full bg-white transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[25px] data-[state=checked]:bg-gray-900" />
                    </Switch.Root>
                  </div>
                </div>

                <input
                  autoComplete="off"
                  id="openrouterAPIKey"
                  name="openrouterAPIKey"
                  className="w-full bg-bg-2 p-2 rounded-md focus:outline-none"
                  placeholder="Enter API Key"
                  type="password"
                  defaultValue={provider?.apiKey}
                />
                <button
                  disabled={isPending}
                  type="submit"
                  className="flex gap-2 items-center self-end px-4 py-1 bg-brand rounded-md mt-4 text-gray-900"
                >
                  {isPending && (
                    <LoadingIcon className="text-gray-900/40 fill-black" />
                  )}
                  <span>Save</span>
                </button>
              </form>
            </div>
          </div>
          <DeleteAllConversation />
        </div>
      </div>
    </div>
  );
}
