import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function providersQueryOptions() {
  return orpc.provider.list.queryOptions({ queryKey: ["providers"] });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.provider.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.provider.key(),
        });
      },
    }),
  );
}
