import { Conversation } from "@/components/Conversation";
import { messagesQueryOptions } from "@/utils/conversation";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/conversation/$conversationID")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ params, context }) => {
    return context.queryClient.fetchQuery(
      messagesQueryOptions(params.conversationID),
    );
  },
  errorComponent: () => {
    return <Navigate to="/" />;
  },
});

function RouteComponent() {
  const { conversationID } = Route.useParams();
  const { data: conversation } = useSuspenseQuery(
    messagesQueryOptions(conversationID),
  );
  return <Conversation messages={conversation.messages} />;
}
