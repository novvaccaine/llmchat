/// <reference types="vite/client" />
import { useEffect, type ReactNode } from 'react'
import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import appCss from '../styles/app.css?url'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@llmchat/core/auth/index'
import { getWebRequest } from '@tanstack/react-start/server'
import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { ws } from '@/utils/ws'

export const getUser = createServerFn().handler(async () => {
  const { headers } = getWebRequest();
  const session = await auth.api.getSession({ headers })
  return session?.user ?? null
})

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'LLM Chat',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Outfit:wght@100..900&display=swap',
      },
    ],
  }),
  component: RootComponent,
  beforeLoad: async () => {
    const user = await getUser()
    return {
      user
    }
  }
})

function RootComponent() {
  const { user, queryClient } = Route.useRouteContext()

  useEffect(() => {
    if (!user) {
      return
    }
    ws.init(queryClient)
  }, [user, queryClient])

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Toaster duration={1500} toastOptions={{ style: { background: 'var(--color-bg-2)', color: 'var(--color-fg)', border: '1px solid var(--color-border)' } }} />
        {children}
        <Scripts />
      </body>
    </html>
  )
}
