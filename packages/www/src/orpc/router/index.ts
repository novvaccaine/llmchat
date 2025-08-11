import { message } from "@/orpc/router/message";
import { conversation } from "@/orpc/router/conversation";
import { provider } from "@/orpc/router/provider";
import { os } from "@orpc/server";
import { authMiddleware } from "@/orpc/middleware";

export const router = os.use(authMiddleware).router({
  message,
  conversation,
  provider,
});
