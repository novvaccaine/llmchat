import z from "zod";
import { db } from "../drizzle";
import { messageTable } from "./message.sql";
import { and, asc, eq } from "drizzle-orm";
import { conversationTable } from "../conversation/conversation.sql";
import { Actor } from "../actor";
import { ulid } from "ulid";

export namespace Message {
  export const Entity = z.object({
    id: z.string(),
    content: z.string(),
    role: z.enum(["assistant", "user"]),
    model: z.string().optional(),
  });

  export type Entity = z.infer<typeof Entity>;

  export type CreateInput = Omit<Entity, "id"> & { conversationID: string };

  export async function create(input: CreateInput) {
    const rows = await db
      .select({ id: conversationTable.id })
      .from(conversationTable)
      .where(
        and(
          eq(conversationTable.userId, Actor.userID()),
          eq(conversationTable.id, input.conversationID),
        ),
      );
    if (!rows.length) {
      throw new Error("invalid conversationID");
    }
    const conversationID = rows[0].id;

    const messageRows = await db
      .insert(messageTable)
      .values({
        id: ulid(),
        conversationID,
        content: input.content,
        role: input.role,
        model: input.model,
      })
      .returning({ id: messageTable.id });

    return messageRows[0].id;
  }

  export async function list(conversationID: string) {
    const rows = await db
      .select()
      .from(conversationTable)
      .where(
        and(
          eq(conversationTable.userId, Actor.userID()),
          eq(conversationTable.id, conversationID),
        ),
      );
    if (!rows.length) {
      throw new Error("conversation not found");
    }
    const conversation = rows[0];

    const messages = await db
      .select({
        id: messageTable.id,
        content: messageTable.content,
        role: messageTable.role,
        model: messageTable.content,
      })
      .from(messageTable)
      .where(and(eq(messageTable.conversationID, conversationID)))
      .orderBy(asc(messageTable.createdAt));

    return {
      id: conversation.id,
      title: conversation.title,
      messages,
    };
  }
}
