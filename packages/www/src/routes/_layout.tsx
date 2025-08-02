import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Sidebar } from '@/components/Sidebar'
import { conversationQueryOptions } from '@/utils/conversation'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_layout')({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.user) {
      return []
    }
    return context.queryClient.ensureQueryData(conversationQueryOptions())
  }
})

function RouteComponent() {
  const { data: conversation } = useSuspenseQuery(conversationQueryOptions())

  return (
    <div className='h-full overflow-auto'>
      <Sidebar conversation={conversation} />
      <div className="ml-[270px] h-full">
        <Outlet />
      </div>
    </div>
  )
}
