import { queryOptions, useMutation } from "@tanstack/react-query";
import { Conversation } from "@llmchat/core/conversation/conversation";
import { Message } from "@llmchat/core/messsage/message";
import { queryClient } from ".";

async function getConversation() {
  const res = await fetch("/api/conversation");
  const data = await res.json();
  return data.conversation as Conversation.Entity[];
}

async function getMessages(conversationID: string) {
  const res = await fetch(`/api/conversation/${conversationID}`);
  const data = await res.json();
  return data.messages as Message.Entity[];
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

export function conversationQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: ["conversation"],
    queryFn: getConversation,
    enabled,
  });
}

export function messagesQueryOptions(conversationID: string) {
  return queryOptions({
    queryKey: ["conversation", conversationID],
    queryFn: () => getMessages(conversationID),
  });
}

export function useCreateConversation() {
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
  return useMutation({
    mutationFn: (input: Message.CreateInput) => updateConversation(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationID],
      });
    },
  });
}
