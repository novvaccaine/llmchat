import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createAuthClient } from "better-auth/react";
import { QueryClient } from "@tanstack/react-query";

export const authClient = createAuthClient();

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});
