import { Hono } from "hono";
import { generateContentActionInput, registry } from "./registry";
import { cors } from "hono/cors";
import { ALLOWED_PUBLIC_HEADERS } from "@rivetkit/actor";
import { env } from "@soonagi/core/env";
import { AppError, errorCodes } from "@soonagi/core/error";
import { zValidator } from "@hono/zod-validator";
export { registry };

const { serve, client } = registry.createServer();

const app = new Hono();
app.use(
  "*",
  cors({
    origin: [env.WEB_URL],
    allowHeaders: ["X-API-KEY", "Authorization", ...ALLOWED_PUBLIC_HEADERS],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.post(
  "/api/stream",
  zValidator("json", generateContentActionInput.omit({ apiKey: true })),
  (c) => {
    const apiKey = c.req.header("X-API-KEY");
    if (apiKey !== env.SVC_API_KEY) {
      throw new AppError(
        "authentication",
        errorCodes.authentication.UNAUTHORIZED,
        "You don't have permission to access this resource",
      );
    }
    const input = c.req.valid("json");
    client.stream
      .getOrCreate(input.userID)
      .generateContent({ ...input, apiKey });
    return c.json({ message: "ok" });
  },
);

export default serve(app);
