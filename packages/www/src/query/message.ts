import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function messagesQueryOptions(conversationID: string) {
  return orpc.message.list.queryOptions({
    input: { conversationID },
  });
}

export function useUpdateMessages() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.message.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.key(),
        });
      },
    }),
  );
}
