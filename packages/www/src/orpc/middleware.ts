import { getUser } from "@/lib/utils";
import { Actor } from "@soonagi/core/actor";
import { ORPCError, os } from "@orpc/server";
import { AppError } from "@soonagi/core/error";

export const authMiddleware = os.middleware(async ({ next }) => {
  const user = await getUser();
  if (!user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return Actor.provide("user", { userID: user.id }, next);
});

export const errorMiddleware = os.middleware(async ({ next }) => {
  try {
    const result = await next({});
    return result;
  } catch (err) {
    if (err instanceof AppError) {
      throw new ORPCError(err.code, {
        message: err.message,
        status: err.statusCode(),
      });
    }
    console.error("rpc handler error", err);
    throw new ORPCError("INTERNAL_SERVER_ERROR");
  }
});
