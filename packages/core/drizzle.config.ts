import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
  strict: true,
  verbose: true,
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DB_URL,
  },
  schema: "./src/**/*.sql.ts",
});
