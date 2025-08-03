import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "../drizzle/types";
import { userTable } from "../auth/auth.sql";
import { Conversation } from "./conversation";

export const conversationTable = sqliteTable("conversation", {
  id: text("id").primaryKey(),
  title: text("title"),
  status: text("status")
    .$type<Conversation.Entity["status"]>()
    .notNull()
    .default("streaming"),

  lastMessageAt: integer("last_message_at", { mode: "timestamp" }).notNull(),
  createdAt: timestamps.createdAt,

  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
});
