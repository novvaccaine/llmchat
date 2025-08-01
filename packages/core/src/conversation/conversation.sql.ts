import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "../drizzle/types";
import { userTable } from "../auth/auth.sql";

export const conversationTable = sqliteTable("conversation", {
  id: text("id").primaryKey(),
  title: text("title"),
  createdAt: timestamps.createdAt,
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});
