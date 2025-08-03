import type { Message } from '@llmchat/core/messsage/message'
import { cn } from '@/utils'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CodeHighlight } from '@/components/CodeHighlight'
import { rehypeInlineCodeProperty } from "react-shiki";
import { useEffect, useRef } from 'react'

type MessagesProps = {
  messages: Message.Entity[]
  streamingContent: string
}

export function Messages(props: MessagesProps) {
  const { messages, streamingContent } = props
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!messagesEndRef.current) {
      return
    }
    messagesEndRef.current.scrollIntoView()
  }, [props.messages, streamingContent])

  return <div className="flex-1 flex flex-col gap-8 pb-10">
    {messages.map((message) => {
      return (
        <div data-message-id={message.id} key={message.id} className={cn('p-2 prose prose-llmchat max-w-none', {
          'self-end border border-border rounded-md bg-bg-2 max-w-[80%]': message.role === 'user',
        })}>
          <MarkdownWrapper content={message.content} />
        </div>
      )
    })}

    {streamingContent && (
      <div className='p-2 prose prose-llmchat max-w-none'>
        <MarkdownWrapper content={streamingContent} />
      </div>
    )}

    <div ref={messagesEndRef} />
  </div>
}

type MarkdownWrapperProps = {
  content: string
}

function MarkdownWrapper(props: MarkdownWrapperProps) {
  return (
    <Markdown components={{ code: CodeHighlight }} remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeInlineCodeProperty]}
    >{props.content}</Markdown>
  )
}
