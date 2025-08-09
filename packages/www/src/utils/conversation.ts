import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Conversation } from "@llmchat/core/conversation/conversation";

// TODO: only call this function is user is authorized
async function getConversation() {
  const res = await fetch("/api/conversation");
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.conversation as Conversation.Entity[];
}

async function createConversation(content: string) {
  const res = await fetch("/api/conversation", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  return data.conversationID as string;
}

async function updateConversation(conversationID: string, title: string) {
  const res = await fetch(`/api/conversation/${conversationID}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
  const data = await res.json();
  return data.conversationID as string;
}

async function deleteConversation(conversationID: string) {
  const res = await fetch(`/api/conversation/${conversationID}`, {
    method: "DELETE",
    body: JSON.stringify({ conversationID }),
  });
  const data = await res.json();
  return data.message as string;
}

async function deleteAllConversation() {
  const res = await fetch(`/api/conversation`, {
    method: "DELETE",
  });
  const data = await res.json();
  return data.message as string;
}

export function conversationQueryOptions() {
  return queryOptions({
    queryKey: ["conversation"],
    queryFn: getConversation,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createConversation(content),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation"],
      });
    },
  });
}

export function useDeleteConveration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationID: string) => deleteConversation(conversationID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation"],
      });
    },
  });
}

export function useDeleteAllConveration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation"],
      });
    },
  });
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { conversationID: string; title: string }) =>
      updateConversation(input.conversationID, input.title),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversation"],
      });
    },
  });
}
