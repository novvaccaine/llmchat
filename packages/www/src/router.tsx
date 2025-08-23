import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { useUIStore } from "@/stores//uiStore";
import * as TanstackQuery from "@/query";

export function createRouter() {
  const rqContext = TanstackQuery.getContext();
  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { ...rqContext },
      // defaultPreload: "intent",
      hydrate() {
        useUIStore.getState().setHasHydrated(true);
      },
      Wrap: (props: { children: React.ReactNode }) => {
        return (
          <TanstackQuery.Provider {...rqContext}>
            {props.children}
          </TanstackQuery.Provider>
        );
      },
    }),
    rqContext.queryClient,
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
