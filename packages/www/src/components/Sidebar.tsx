import { authClient } from '@/utils'
import { LogIn as LoginIcon } from 'lucide-react';
import { Link } from '@tanstack/react-router'
import { Route } from '@/routes/__root';
import { Conversation } from '@llmchat/core/conversation/conversation';
import * as Tooltip from "@radix-ui/react-tooltip";
import { LoadingIcon } from './LoadingIcon';
import { useConversationStore } from '@/utils/conversationStore';

type Props = {
  conversation: Conversation.Entity[]
}

export function Sidebar(props: Props) {
  const user = Route.useRouteContext().user
  const conversation = useConversationStore().conversation

  const signIn = async () => {
    await authClient.signIn.social({
      provider: "google",
    })
  }

  return (
    <div className="bg-sidebar p-4 fixed top-0 left-0 h-full w-[270px] flex flex-col">
      <Link to="/">LLM Chat</Link>

      <Link to="/" className='mt-3 bg-brand text-black px-4 py-2 rounded-md text-center'>
        New Chat
      </Link>

      <div className='mt-6 flex flex-col gap-0.5'>
        {props.conversation.map(c => {
          const entry = conversation[c.id]
          const title = (entry?.title ?? c.title) ?? 'Untitled'

          return (
            <Tooltip.Provider key={c.id}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <Link className='hover:bg-bg px-4 py-2 rounded-md flex gap-4 items-center' to="/conversation/$conversationID" params={{ conversationID: c.id }} activeProps={{ className: 'bg-bg' }}>
                    <span className='truncate'>{title}</span>
                    {entry && (
                      <LoadingIcon className='shrink-0 text-brand/40 fill-white ml-auto' />
                    )}
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content className='bg-bg px-2 py-1 rounded-md border border-border' side='bottom'>
                    {title}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )
        })}
      </div>

      <div className='mt-auto'>
        {user ? (
          <Link to="/settings" className='px-3 py-2 rounded-md flex gap-3 items-center hover:bg-bg'>
            <img className='size-8 rounded-full' src={user.image!} alt="avatar" referrerPolicy='no-referrer' />
            <span>{user.name}</span>
          </Link>
        ) : (
          <button onClick={signIn} className='flex gap-3 items-center hover:bg-bg w-full px-4 py-2 rounded-md'>
            <span><LoginIcon size={16} /></span>
            <span>Login</span>
          </button>
        )}
      </div>
    </div>
  )
}
