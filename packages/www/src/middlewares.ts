import { createMiddleware, json } from "@tanstack/react-start";
import { Actor } from "@llmchat/core/actor";
import { getUser } from "./routes/__root";
import { ZodObject } from "zod";

export const authMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    const user = await getUser();
    if (!user) {
      return json({ message: "unauthorized" }, { status: 401 });
    }
    return Actor.provide("user", { userID: user.id }, next);
  },
);

export function validationMiddleware<T extends ZodObject>(schema: T) {
  return createMiddleware({ type: "request" }).server(
    async ({ next, request }) => {
      const body = await request.json();
      const result = schema.safeParse(body);
      if (!result.success) {
        throw json({ message: "invalid body" }, { status: 400 });
      }
      return next({ context: { input: result.data } });
    },
  );
}
