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
    return context.queryClient.ensureQueryData(conversationQueryOptions(true))
  }
})

// TODO: test this component to check how it handles when the user is not logged in
function RouteComponent() {
  const enabled = Route.useRouteContext().user !== null
  const { data: conversation } = useSuspenseQuery(conversationQueryOptions(enabled))

  return (
    <div className='h-full'>
      <Sidebar conversation={conversation} />
      <div className="ml-[270px] h-full">
        <Outlet />
      </div>
    </div>
  )
}
