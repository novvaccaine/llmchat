import { authClient } from "@/lib/utils";
import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { ArrowLeft as LeftIcon, Key as KeyIcon } from "lucide-react";
import { providersQueryOptions, useUpdateProvider } from "@/query/provider";
import { LoadingIcon } from "@/components/LoadingIcon";
import { toast } from "sonner";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DeleteAllConversation } from "@/components/DeleteAllConversation";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context }) => {
    return context.queryClient.fetchQuery(providersQueryOptions());
  },
});

function RouteComponent() {
  const router = useRouter();
  const { data: providers } = useSuspenseQuery(providersQueryOptions());
  const openrouterAPIKey =
    providers.find((p) => p.provider === "openrouter")?.apiKey ?? "";

  const user = Route.useRouteContext().user!;
  const image = user.image!.replace(/=.+$/, "");

  const { mutateAsync: updateProvider, isPending } = useUpdateProvider();

  function signOut() {
    authClient.signOut(
      {},
      {
        onSuccess: () => {
          router.invalidate();
        },
      },
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const key = formData.get("openrouterAPIKey");
    if (!key) {
      return;
    }

    const apiKey = key.toString();
    if (!apiKey.trim().length) {
      return;
    }

    const input = {
      apiKey: apiKey.trim(),
      provider: "openrouter",
    } as const;

    try {
      await updateProvider(input);
      toast.success("API key updated");
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
          <div className="mb-8">
            <p className="text-xl font-semibold mb-5">API Keys</p>
            <div className="border border-border p-4 rounded-md">
              <form className="flex flex-col" onSubmit={onSubmit}>
                <label
                  className="self-start inline-flex gap-3 items-center mb-3"
                  htmlFor="openrouterAPIKey"
                >
                  <KeyIcon size={16} />
                  <span>OpenRouter API Key</span>
                </label>
                <input
                  autoComplete="off"
                  name="openrouterAPIKey"
                  id="openrouterAPIKey"
                  className="w-full bg-bg-2 p-2 rounded-md focus:outline-none"
                  placeholder="Enter API Key"
                  type="password"
                  defaultValue={openrouterAPIKey}
                />
                <button
                  disabled={isPending}
                  type="submit"
                  className="flex gap-2 items-center self-end px-4 py-1 bg-brand rounded-md mt-4 text-black"
                >
                  {isPending && (
                    <LoadingIcon className="text-black/40 fill-black" />
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
