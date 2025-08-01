import { Conversation } from '@/components/Conversation'
import { messagesQueryOptions } from '@/utils/conversation'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/_authed/conversation/$conversationID')({
  component: RouteComponent,
  loader: ({ params, context }) => {
    return context.queryClient.ensureQueryData(messagesQueryOptions(params.conversationID))
  }
})

function RouteComponent() {
  const { conversationID } = Route.useParams()
  const { data: messages } = useSuspenseQuery(messagesQueryOptions(conversationID))
  return <Conversation messages={messages} />
}
