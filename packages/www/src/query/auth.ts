import { queryOptions, useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/utils";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@soonagi/core/auth/index";
import { getWebRequest } from "@tanstack/react-start/server";

export function useLogin() {
  return useMutation({
    mutationFn: () =>
      authClient.signIn.social({
        provider: "google",
      }),
  });
}

export const getUser = createServerFn().handler(async () => {
  const { headers } = getWebRequest();
  const session = await auth.api.getSession({ headers });
  return session?.user ?? null;
});

export function authQueryOptions() {
  return queryOptions({
    queryKey: ["authUser"],
    queryFn: getUser,
  });
}
