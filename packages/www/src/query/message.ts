import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function messagesQueryOptions(conversationID: string) {
  return orpc.message.list.queryOptions({
    input: { conversationID },
  });
}

// TODO: function which abstracts the repeated logic here
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

export function useEditMessage() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.message.edit.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.key(),
        });
      },
    }),
  );
}

export function useRetryMessage() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.message.retry.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.key(),
        });
      },
    }),
  );
}
