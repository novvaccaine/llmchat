import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/utils";

export function useLogin() {
  return useMutation({
    mutationFn: () =>
      authClient.signIn.social({
        provider: "google",
      }),
  });
}
