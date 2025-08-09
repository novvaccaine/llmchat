import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function titleTag(title: string) {
  return `${title} - LLM Chat`;
}
