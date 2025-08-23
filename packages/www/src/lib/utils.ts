import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createAuthClient } from "better-auth/react";
import { Conversation } from "@soonagi/core/conversation/conversation";
import { auth } from "@soonagi/core/auth/index";
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

export function createSEOTags() {
  const description = "Yet Another AI Chat App";
  const title = "Soon AGI";

  // TODO: how to get this from env? it should be
  // process.env or import.meta.env?
  const url = "https://soonagi.com/";
  const image = "https://soonagi.com/og.png";

  return {
    title,
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "description",
        content: description,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: url,
      },
      {
        property: "og:title",
        content: title,
      },
      {
        property: "og:description",
        content: description,
      },
      {
        property: "og:image",
        content: image,
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:url",
        content: url,
      },
      {
        name: "twitter:title",
        content: title,
      },
      {
        name: "twitter:description",
        content: description,
      },
      {
        name: "twitter:image",
        content: image,
      },
    ],
  };
}
