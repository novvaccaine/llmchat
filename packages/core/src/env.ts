import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    WEB_URL: z.string(),
    STREAM_URL: z.string(),

    TURSO_CONNECTION_URL: z.string(),
    TURSO_AUTH_TOKEN: z.string(),

    BETTER_AUTH_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true
});
