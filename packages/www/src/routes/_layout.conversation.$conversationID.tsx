import { Conversation } from "@/components/Conversation";
import { titleTag } from "@/utils";
import { useConversationStore } from "@/utils/conversationStore";
import { messagesQueryOptions } from "@/utils/message";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  AnyRouteMatch,
  createFileRoute,
  Navigate,
  redirect,
} from "@tanstack/react-router";

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
  head: ({ loaderData }) => {
    const meta: AnyRouteMatch["meta"] = [];
    if (loaderData?.title) {
      meta.push({ title: titleTag(loaderData.title) });
    }
    return {
      meta,
    };
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
  const title = useConversationStore().conversation[conversation.id]?.title;
  return (
    <>
      {title && <title>{titleTag(title)}</title>}
      <Conversation messages={conversation.messages} />
    </>
  );
}
