import { Hono } from "hono";
import { registry } from "./registry.js";
import { cors } from "hono/cors";
import { ALLOWED_PUBLIC_HEADERS } from "@rivetkit/actor";
import { env } from "@llmchat/core/env";

export { registry };

const app = new Hono();

app.use(
  "*",
  cors({
    origin: [env.WEB_URL],
    allowHeaders: ["Authorization", ...ALLOWED_PUBLIC_HEADERS],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

const { serve } = registry.createServer();
serve(app);
