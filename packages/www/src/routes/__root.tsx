/// <reference types="vite/client" />
import { useEffect, type ReactNode } from "react";
import {
  Outlet,
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import appCss from "@/styles/app.css?url";
import type { QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { actor } from "@/lib/Actor";
import { NotFound } from "@/components/NotFound";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { getUser } from "@/lib/utils";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "LLM Chat",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/logo.svg",
      },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Outfit:wght@100..900&display=swap",
      },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorBoundary,
  beforeLoad: async () => {
    const user = await getUser();
    return {
      user,
    };
  },
});

function RootComponent() {
  const { user, queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!user) {
      return;
    }
    actor.init(user.id, queryClient);
  }, [user, queryClient]);

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body className="bg-[url(/noise.png)] bg-repeat bg-auto">
        <Toaster
          position="top-right"
          duration={1500}
          toastOptions={{
            style: {
              background: "var(--color-bg-2)",
              color: "var(--color-fg)",
              border: "1px solid var(--color-border)",
            },
          }}
        />
        {children}
        <Scripts />
      </body>
    </html>
  );
}
