import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/orpc/client";

export function conversationQueryOptions(enabled: boolean) {
  return orpc.conversation.list.queryOptions({
    enabled,
  });
}

// TODO: always invalidate when performing any mutations automagically?
export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.conversation.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.conversation.list.key(),
        });
      },
    }),
  );
}

export function useDeleteConveration() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.conversation.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.conversation.list.key(),
        });
      },
    }),
  );
}

export function useDeleteAllConveration() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.conversation.deleteAll.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.conversation.list.key(),
        });
      },
    }),
  );
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.conversation.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.conversation.list.key(),
        });
      },
    }),
  );
}

export function useBranchOff() {
  const queryClient = useQueryClient();
  return useMutation(
    orpc.conversation.branchOff.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.conversation.list.key(),
        });
      },
    }),
  );
}
