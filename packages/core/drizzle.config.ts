import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
  strict: true,
  verbose: true,
  out: "./migrations",
  dialect: "turso",
  dbCredentials: {
    url: env.TURSO_CONNECTION_URL,
    authToken: env.TURSO_AUTH_TOKEN!,
  },
  schema: "./src/**/*.sql.ts",
});
