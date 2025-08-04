import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Conversation } from "@llmchat/core/conversation/conversation";
import { Message } from "@llmchat/core/messsage/message";

async function getMessages(conversationID: string) {
  const res = await fetch(`/api/conversation/${conversationID}/message`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error("failed to fetch messages for conversation");
  }
  return data.conversation as Conversation.Entity & {
    messages: Message.Entity[];
  };
}

async function updateMessages(input: Message.CreateInput) {
  const { conversationID, ...other } = input;
  const res = await fetch(`/api/conversation/${conversationID}/message`, {
    method: "PUT",
    body: JSON.stringify({ ...other }),
  });
  const data = await res.json();
  return data.messageID as string;
}

export function messagesQueryOptions(conversationID: string) {
  return queryOptions({
    queryKey: ["conversation", conversationID],
    queryFn: () => getMessages(conversationID),
  });
}

export function useUpdateMessages() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Message.CreateInput) => updateMessages(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationID],
      });
    },
  });
}
