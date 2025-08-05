import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    STREAM_URL: z.string(),

    TURSO_CONNECTION_URL: z.string(),
    TURSO_AUTH_TOKEN: z.string(),

    BETTER_AUTH_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),

    OPENROUTER_API_KEY: z.string(),
  },
  runtimeEnv: process.env,
})
