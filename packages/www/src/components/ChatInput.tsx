import React, { useState } from 'react'

type ChatInputProps = {
  onNewMessage: (content: string) => void
}

export function ChatInput(props: ChatInputProps) {
  const [content, setContent] = useState('')

  async function handleSubmit() {
    const input = content.trim()
    if (!input.length) {
      return
    }
    setContent('')
    props.onNewMessage(input)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className='grid place-items-center sticky bottom-0 left-[270px] w-full max-w-3xl z-[4]'>
      <textarea className="rounded-t-md bg-bg-2 border border-border w-full p-2 resize-none focus:outline-none" rows={4}
        placeholder='Type your message here...'
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
