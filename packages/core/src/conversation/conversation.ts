import z from "zod";
import { db } from "../drizzle";
import { ulid } from "ulid";
import { conversationTable } from "./conversation.sql";
import { messageTable } from "../messsage/message.sql";
import { Actor } from "../actor";
import { and, desc, eq } from "drizzle-orm";

export namespace Conversation {
  export const Entity = z.object({
    id: z.string(),
    title: z.string().optional(),
  });

  export type Entity = z.infer<typeof Entity>;

  export function create(content: string) {
    return db.transaction(async (tx) => {
      const rows = await tx
        .insert(conversationTable)
        .values({
          id: ulid(),
          userId: Actor.userID(),
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
      })
      .from(conversationTable)
      .where(eq(conversationTable.userId, Actor.userID()))
      .orderBy(desc(conversationTable.createdAt));
  }


  export async function update(conversationID: string, title: string) {
    return db.update(conversationTable)
      .set({ title })
      .where(
        and(
          eq(conversationTable.userId, Actor.userID()),
          eq(conversationTable.id, conversationID),
        ),
      ).returning({ id: conversationTable.id });
  }
}
