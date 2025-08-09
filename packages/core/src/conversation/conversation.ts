import z from "zod";
import { db } from "../drizzle";
import { ulid } from "ulid";
import { conversationTable } from "./conversation.sql";
import { messageTable } from "../messsage/message.sql";
import { Actor } from "../actor";
import { and, desc, eq, ne } from "drizzle-orm";

export namespace Conversation {
  export const Entity = z.object({
    id: z.string(),
    title: z.string().optional(),
    status: z.enum(["none", "deleted", "streaming"]),
    lastMessageAt: z.string(),
  });

  export type Entity = z.infer<typeof Entity>;

  const MESSAGES_LIMIT = 50;

  export function create(content: string) {
    return db.transaction(async (tx) => {
      const rows = await tx
        .insert(conversationTable)
        .values({
          id: ulid(),
          userId: Actor.userID(),
          lastMessageAt: new Date(),
        })
        .returning({ id: conversationTable.id });
      const conversationID = rows[0].id;

      await tx.insert(messageTable).values({
        id: ulid(),
        content,
        role: "user",
        conversationID,
      });

      return conversationID;
    });
  }

  export function list() {
    return db
      .select({
        id: conversationTable.id,
        title: conversationTable.title,
        lastMessageAt: conversationTable.lastMessageAt,
      })
      .from(conversationTable)
      .where(
        and(
          eq(conversationTable.userId, Actor.userID()),
          ne(conversationTable.status, "deleted"),
        ),
      )
      .orderBy(desc(conversationTable.lastMessageAt))
      .limit(MESSAGES_LIMIT); // TODO: pagination
  }

  type UpdateInput = Partial<Pick<Entity, "title" | "status">>;

  export async function update(conversationID: string, input: UpdateInput) {
    const updateColumns: Record<string, any> = {};
    if (input.title !== undefined) {
      updateColumns.title = input.title;
    }
    if (input.status !== undefined) {
      updateColumns.status = input.status;
    }

    const rows = await db
      .update(conversationTable)
      .set(updateColumns)
      .where(
        and(
          eq(conversationTable.userId, Actor.userID()),
          eq(conversationTable.id, conversationID),
          ne(conversationTable.status, "deleted"),
        ),
      )
      .returning({ id: conversationTable.id });

    if (rows.length !== 1) {
      throw new Error("expected one row to be affected");
    }

    return rows[0].id;
  }

  export async function remove(conversationID: string) {
    const rows = await db
      .update(conversationTable)
      .set({ status: "deleted" })
      .where(
        and(
          eq(conversationTable.userId, Actor.userID()),
          eq(conversationTable.id, conversationID),
          eq(conversationTable.status, "none"),
        ),
      )
      .returning({ id: conversationTable.id });

    if (rows.length !== 1) {
      throw new Error("expected one row to be affected");
    }

    return rows[0].id;
  }
}
