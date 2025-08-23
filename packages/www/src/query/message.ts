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
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key({
            input: { conversationID: variables.conversationID },
          }),
        });
      },
    }),
  );
}

export function useEditMessage() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.message.edit.mutationOptions({
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key({
            input: { conversationID: variables.conversationID },
          }),
        });
      },
    }),
  );
}

export function useRetryMessage() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.message.retry.mutationOptions({
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: orpc.message.list.key({
            input: { conversationID: variables.conversationID },
          }),
        });
      },
    }),
  );
}
