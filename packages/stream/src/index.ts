import { Hono, MiddlewareHandler } from "hono";
import { auth } from "@llmchat/core/auth/index";
import { Actor } from "@llmchat/core/actor";
export { StreamDO } from "./StreamDO";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

const app = new Hono<{
  Bindings: Cloudflare.Env & { OPENROUTER_API_KEY: string };
}>();

const authMiddleware: MiddlewareHandler = async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session?.user) {
    return c.json({ message: "unauthorized" }, 401);
  }
  return Actor.provide("user", { userID: session.user.id }, next);
};

app.post(
  "/conversation/:conversationID/stream",
  authMiddleware,
  zValidator("json", z.object({ model: z.string() })),
  async (c) => {
    const conversationID = c.req.param("conversationID");
    const model = c.req.valid("json").model;

    const doID = c.env.STREAM_DO.idFromName(Actor.userID());
    const stub = c.env.STREAM_DO.get(doID);
    stub.generateContent(conversationID, Actor.userID(), model);

    return c.json({ message: "ok" });
  },
);

app.get("/ws", authMiddleware, (c) => {
  const upgradeHeader = c.req.header("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return c.text("Expected websocket", 400);
  }
  const doID = c.env.STREAM_DO.idFromName(Actor.userID());
  const stub = c.env.STREAM_DO.get(doID);
  return stub.fetch(c.req.raw);
});

export default app;
