import { pgTable, text } from "drizzle-orm/pg-core";
import { timestamps } from "../db/types";
import { Message } from "./message";
import { conversationTable } from "../conversation/conversation.sql";

export const messageTable = pgTable("message", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").$type<Message.Entity["role"]>().notNull(),
  model: text("model"),
  conversationID: text("conversation_id")
    .notNull()
    .references(() => conversationTable.id, { onDelete: "cascade" }),
  createdAt: timestamps.createdAt,
});
