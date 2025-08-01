import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { timestamps } from "../drizzle/types";
import { Message } from './message'
import { conversationTable } from "../conversation/conversation.sql";

export const messageTable = sqliteTable("message", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").$type<Message.Entity["role"]>().notNull(),
  model: text("model"),
  conversationID: text("conversation_id")
    .notNull()
    .references(() => conversationTable.id, { onDelete: "cascade" }),
  createdAt: timestamps.createdAt,
});
