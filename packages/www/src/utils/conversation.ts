import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Conversation } from "@llmchat/core/conversation/conversation";
import { Message } from "@llmchat/core/messsage/message";

// TODO: only call this function is user is authorized
async function getConversation() {
  const res = await fetch("/api/conversation");
  if (!res.ok) {
    return [];
  }
  const data = await res.json();
  return data.conversation as Conversation.Entity[];
}

async function getMessages(conversationID: string) {
  const res = await fetch(`/api/conversation/${conversationID}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error("failed to fetch messages for conversation");
  }
  return data.conversation as Conversation.Entity & {
    messages: Message.Entity[];
  };
}

async function createConversation(content: string) {
  const res = await fetch("/api/conversation", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  const data = await res.json();
  return data.conversationID as string;
}

async function updateConversation(input: Message.CreateInput) {
  const { conversationID, ...other } = input;
  const res = await fetch(`/api/conversation/${conversationID}`, {
    method: "PUT",
    body: JSON.stringify({ ...other }),
  });
  const data = await res.json();
  return data.messageID as string;
}

async function deleteConversation(conversationID: string) {
  const res = await fetch(`/api/conversation/${conversationID}`, {
    method: "DELETE",
    body: JSON.stringify({ conversationID }),
  });
  const data = await res.json();
  return data.conversationID as string;
}

export function conversationQueryOptions() {
  return queryOptions({
    queryKey: ["conversation"],
    queryFn: getConversation,
  });
}

export function messagesQueryOptions(conversationID: string) {
  return queryOptions({
    queryKey: ["conversation", conversationID],
    queryFn: () => getMessages(conversationID),
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

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Message.CreateInput) => updateConversation(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationID],
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
