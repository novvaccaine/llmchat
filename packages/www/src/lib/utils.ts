import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createAuthClient } from "better-auth/react";
import { Conversation } from "@soonagi/core/conversation/conversation";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@soonagi/core/auth/index";
import { getWebRequest } from "@tanstack/react-start/server";
import { customSessionClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [customSessionClient<typeof auth>()],
});

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function titleTag(title: string) {
  return `${title} - Soon AGI`;
}

export function splitConversationsByDate(
  conversations: Conversation.Entity[],
): Conversation.Entity[][] {
  const now = new Date();

  const todayStart = startOfDayUTC(now);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setUTCDate(todayStart.getUTCDate() - 1);

  const sevenDaysAgoStart = new Date(todayStart);
  sevenDaysAgoStart.setUTCDate(todayStart.getUTCDate() - 7);

  function startOfDayUTC(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  const today: Conversation.Entity[] = [];
  const yesterday: Conversation.Entity[] = [];
  const last7Days: Conversation.Entity[] = [];
  const last30Days: Conversation.Entity[] = [];

  for (const conv of conversations) {
    const msgDate = new Date(conv.lastMessageAt);

    if (msgDate >= todayStart) {
      today.push(conv);
    } else if (msgDate >= yesterdayStart && msgDate < todayStart) {
      yesterday.push(conv);
    } else if (msgDate >= sevenDaysAgoStart && msgDate < yesterdayStart) {
      last7Days.push(conv);
    } else {
      last30Days.push(conv);
    }
  }

  return [today, yesterday, last7Days, last30Days];
}

export const getUser = createServerFn().handler(async () => {
  const { headers } = getWebRequest();
  const session = await auth.api.getSession({ headers });
  return session?.user ?? null;
});
