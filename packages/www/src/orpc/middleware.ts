import { getUser } from "@/lib/utils";
import { Actor } from "@llmchat/core/actor";
import { ORPCError, os } from "@orpc/server";

export const authMiddleware = os.middleware(async ({ next }) => {
  const user = await getUser();
  if (!user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return Actor.provide("user", { userID: user.id }, next);
});
