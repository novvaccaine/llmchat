import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    WEB_URL: z.string(),
    STREAM_URL: z.string(),
    SVC_API_KEY: z.string(),
    DB_URL: z.string(),
    OPENROUTER_API_KEY: z.string(),
    REDIS_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    JINA_API_KEY: z.string(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
