import { Messages } from '@/components/Messages'
import { ChatInput } from '@/components/ChatInput'
import type { Message } from '@llmchat/core/messsage/message'
import { useCreateConversation, useUpdateConversation } from "@/utils/conversation";
import { toast } from "sonner";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useStreamStore } from "@/utils/streamStore";

type Props = {
  messages: Message.Entity[]
}

export function Conversation(props: Props) {
  const { mutateAsync: createConversation } = useCreateConversation()
  const { mutateAsync: updateConversation } = useUpdateConversation()
  const navigate = useNavigate()
  const { conversationID } = useParams({ strict: false })
  const streamingContent = useStreamStore().conversation[conversationID!]?.content

  async function onNewMessage(content: string) {
    try {
      if (!props.messages.length) {
        const conversationID = await createConversation(content)
        navigate({ to: '/conversation/$conversationID', params: { conversationID } })
      } else {
        await updateConversation({ content, conversationID: conversationID!, role: "user" })
      }
    } catch (err) {
      console.error("failed to get response", err)
      toast.error("Failed to get response")
    }
  }

  return (
    <div className="h-full max-w-3xl mx-auto px-4 pt-8 flex flex-col">
      <Messages messages={props.messages} streamingContent={streamingContent} />
      <ChatInput onNewMessage={onNewMessage} />
    </div>
  )
}
