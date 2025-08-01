import { createMiddleware, json } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { Actor } from "@llmchat/core/actor";
import { getUser } from "./routes/__root";
import { ZodObject } from "zod";

export const authMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next }) => {
    const user = await getUser();
    if (!user) {
      setResponseStatus(401);
      return json({ message: "unauthorized" });
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
        setResponseStatus(400);
        throw json({ message: "invalid body" });
      }
      return next({ context: { input: result.data } });
    },
  );
}
