import { pgTable, text, primaryKey, boolean } from "drizzle-orm/pg-core";
import { userTable } from "../auth/auth.sql";
import { timestamps } from "../db/types";
import { Provider } from "./provider";

export const providerTable = pgTable(
  "provider",
  {
    ...timestamps,
    provider: text("provider").$type<Provider.Entity["provider"]>().notNull(),
    active: boolean("active").notNull(),
    apiKey: text("api_key").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.provider] })],
);
