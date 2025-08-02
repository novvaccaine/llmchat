import { Messages } from '@/components/Messages'
import { ChatInput } from '@/components/ChatInput'
import type { Message } from '@llmchat/core/messsage/message'
import { useCreateConversation, useUpdateConversation } from "@/utils/conversation";
import { toast } from "sonner";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useConversationStore } from "@/utils/conversationStore";
import { createServerFn } from '@tanstack/react-start'
import z from 'zod';
import { getCookie } from '@tanstack/react-start/server';
import { useStickToBottom } from 'use-stick-to-bottom';

type Props = {
  messages: Message.Entity[]
}

const model = "openai/gpt-4.1-mini"

const startStream = createServerFn({ method: 'POST' }).
  validator(z.object({
    conversationID: z.string(),
    model: z.string(),
  })).
  handler(async ({ data }) => {
    // TODO: accessing cookie like this feels ugly, can you do better?
    const cookie = getCookie("better-auth.session_token")
    const res = await fetch(
      process.env.STREAM_URL + `/conversation/${data.conversationID}/stream`,
      {
        method: "POST",
        body: JSON.stringify({ model: data.model }),
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `better-auth.session_token=${cookie}`,
        }
      },
    )
    if (!res.ok) {
      throw new Error("failed to start stream")
    }
    return res.json()
  })

export function Conversation(props: Props) {
  const { mutateAsync: createConversation } = useCreateConversation()
  const { mutateAsync: updateConversation } = useUpdateConversation()
  const navigate = useNavigate()
  const { conversationID } = useParams({ strict: false })
  const streamingContent = useConversationStore().conversation[conversationID!]?.content
  const { scrollRef, contentRef } = useStickToBottom()

  async function onNewMessage(content: string) {
    const isNewConversation = !props.messages.length

    try {
      let cID = conversationID
      if (isNewConversation) {
        cID = await createConversation(content)
      } else {
        await updateConversation({ content, conversationID: cID!, role: "user" })
      }

      await startStream({
        data: {
          conversationID: cID!,
          model
        }
      })

      if (isNewConversation) {
        navigate({ to: '/conversation/$conversationID', params: { conversationID: cID! } })
      }
    } catch (err) {
      console.error("failed to get response", err)
      toast.error("Failed to get response")
    }
  }

  return (
    <div className="h-full px-4 pt-8 overflow-auto flex flex-col" ref={scrollRef}>
      <div className='w-full max-w-3xl mx-auto flex flex-col flex-1' ref={contentRef}>
        <Messages messages={props.messages} streamingContent={streamingContent} />
        <ChatInput onNewMessage={onNewMessage} />
      </div>
    </div>
  )
}
