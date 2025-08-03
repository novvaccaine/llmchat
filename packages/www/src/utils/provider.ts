import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Provider } from "@llmchat/core/provider/provider";

async function getProviders() {
  const res = await fetch("/api/provider");
  const data = await res.json();
  return data.providers as Provider.Entity[];
}

export function providersQueryOptions() {
  return queryOptions({
    queryKey: ["providers"],
    queryFn: getProviders,
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: Provider.Entity) =>
      fetch("/api/provider", {
        method: "POST",
        body: JSON.stringify(provider),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["providers"],
      });
    },
  });
}
