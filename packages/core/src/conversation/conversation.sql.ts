import { pgTable, text, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { timestamps } from "../db/types";
import { userTable } from "../auth/auth.sql";
import { Conversation } from "./conversation";

export const conversationTable = pgTable(
  "conversation",
  {
    id: text("id").primaryKey(),
    title: text("title"),
    status: text("status")
      .$type<Conversation.Entity["status"]>()
      .notNull()
      .default("none"),
    branchedFrom: text("branched_from"),

    lastMessageAt: timestamp("last_message_at").notNull(),
    createdAt: timestamps.createdAt,

    userId: text("user_id")
      .notNull()
      .references(() => userTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    foreignKey({
      columns: [table.branchedFrom],
      foreignColumns: [table.id],
    }).onDelete("set null"),
  ],
);
