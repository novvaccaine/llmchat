import { createServerFileRoute } from "@tanstack/react-start/server";
import { json } from "@tanstack/react-start";
import { authMiddleware, validationMiddleware } from "@/middlewares";
import { Provider } from "@llmchat/core/provider/provider";

export const ServerRoute = createServerFileRoute("/api/provider").methods(
  (api) => ({
    POST: api
      .middleware([authMiddleware, validationMiddleware(Provider.Entity)])
      .handler(async ({ context }) => {
        await Provider.create(context.input);
        return json({ message: "ok" });
      }),

    GET: api
      .middleware([authMiddleware])
      .handler(async () => {
        const providers = await Provider.list();
        return json({ providers });
      }),
  }),
);
