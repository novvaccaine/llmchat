import z from "zod";
import { db } from "../db";
import { messageTable } from "./message.sql";
import { and, asc, eq, gte, ne, sql, gt } from "drizzle-orm";
import { conversationTable } from "../conversation/conversation.sql";
import { Actor } from "../actor";
import { ulid } from "ulid";
import { AppError, errorCodes } from "../error";
import { storage } from "../storage";
import { getTodayDateUTC, triggerStream } from "../utils";

export namespace Message {
  export const Entity = z.object({
    id: z.string(),
    content: z.string(),
    role: z.enum(["assistant", "user"]),
    model: z.string().optional().nullable(),
  });

  export type Entity = z.infer<typeof Entity>;

  export type CreateInput = Omit<Entity, "id"> & { conversationID: string };

  export async function create(input: CreateInput) {
    const messageID = await db.transaction(async (tx) => {
      const rows = await tx
        .select({ id: conversationTable.id, status: conversationTable.status })
        .from(conversationTable)
        .where(
          and(
            eq(conversationTable.userId, Actor.userID()),
            eq(conversationTable.id, input.conversationID),
            eq(
              conversationTable.status,
              input.role === "assistant" ? "streaming" : "none",
            ),
          ),
        );
      if (!rows.length) {
        throw new AppError(
          "not_found",
          errorCodes.notFound.RESOURCE_NOT_FOUND,
          "Conversation not found",
        );
      }
      const conversation = rows[0];

      await tx
        .update(conversationTable)
        .set({
          status: "none",
          lastMessageAt: new Date(),
        })
        .where(eq(conversationTable.id, input.conversationID));

      const messageRows = await tx
        .insert(messageTable)
        .values({
          id: ulid(),
          conversationID: conversation.id,
          content: input.content,
          role: input.role,
          model: input.role === "assistant" ? input.model : undefined,
        })
        .returning({ id: messageTable.id });

      return messageRows[0].id;
    });

    if (input.role === "user") {
      await triggerStream(Actor.userID(), input.conversationID, input.model!);
    }

    return messageID;
  }

  export type EditInput = Omit<CreateInput, "role"> & { messageID: string };

  export async function edit(input: EditInput) {
    const messageID = await db.transaction(async (tx) => {
      const rows = await tx
        .select({ id: messageTable.id, createdAt: messageTable.createdAt })
        .from(messageTable)
        .innerJoin(
          conversationTable,
          and(
            eq(conversationTable.id, messageTable.conversationID),
            eq(conversationTable.status, "none"),
            eq(conversationTable.userId, Actor.userID()),
          ),
        )
        .where(
          and(
            eq(messageTable.id, input.messageID),
            eq(messageTable.role, "user"),
          ),
        );

      if (!rows.length) {
        throw new AppError(
          "not_found",
          errorCodes.notFound.RESOURCE_NOT_FOUND,
          "Message not found",
        );
      }
      const message = rows[0];

      const messageRows = await tx
        .update(messageTable)
        .set({ content: input.content })
        .where(eq(messageTable.id, message.id))
        .returning({ id: messageTable.id });

      await tx
        .delete(messageTable)
        .where(gt(messageTable.createdAt, message.createdAt));

      return messageRows[0].id;
    });

    await triggerStream(Actor.userID(), input.conversationID, input.model!);

    return messageID;
  }

  type RetryInput = Omit<EditInput, "content">;

  export async function retry(input: RetryInput) {
    let model = input.model;

    await db.transaction(async (tx) => {
      const rows = await tx
        .select({
          id: messageTable.id,
          createdAt: messageTable.createdAt,
          role: messageTable.role,
          model: messageTable.model,
        })
        .from(messageTable)
        .innerJoin(
          conversationTable,
          and(
            eq(conversationTable.id, messageTable.conversationID),
            eq(conversationTable.status, "none"),
            eq(conversationTable.userId, Actor.userID()),
          ),
        )
        .where(
          and(
            gte(
              messageTable.createdAt,
              sql`(SELECT ${messageTable.createdAt} FROM ${messageTable} WHERE id = ${input.messageID})`,
            ),
            eq(conversationTable.id, messageTable.conversationID),
            eq(conversationTable.status, "none"),
            eq(conversationTable.userId, Actor.userID()),
          ),
        )
        .orderBy(messageTable.createdAt)
        .limit(2);

      if (!rows.length) {
        throw new AppError(
          "not_found",
          errorCodes.notFound.RESOURCE_NOT_FOUND,
          "Message not found",
        );
      }

      const assistantMessage = rows.find((row) => row.role === "assistant");
      if (!assistantMessage) {
        throw new AppError(
          "not_found",
          errorCodes.notFound.RESOURCE_NOT_FOUND,
          "Assistant message not found",
        );
      }

      await tx
        .delete(messageTable)
        .where(gte(messageTable.createdAt, assistantMessage.createdAt));

      if (!input.model) {
        model = assistantMessage.model as string;
      }
    });

    await triggerStream(Actor.userID(), input.conversationID, model!);
  }

  export async function list(conversationID: string) {
    const rows = await db
      .select()
      .from(conversationTable)
      .where(
        and(
          eq(conversationTable.userId, Actor.userID()),
          eq(conversationTable.id, conversationID),
          ne(conversationTable.status, "deleted"),
        ),
      );
    if (!rows.length) {
      throw new AppError(
        "not_found",
        errorCodes.notFound.RESOURCE_NOT_FOUND,
        "Conversation not found",
      );
    }
    const conversation = rows[0];

    const messages = await db
      .select({
        id: messageTable.id,
        content: messageTable.content,
        role: messageTable.role,
        model: messageTable.model,
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

  // free messages

  export const FREE_MESSAGES_PER_DAY = 100;
  const CACHE_EXPIRY = 24 * 60 * 60; // 24h

  const cacheKey = (userID: string) =>
    `free_messages_count:${userID}:${getTodayDateUTC()}`;

  async function freeMessagesCount() {
    const key = cacheKey(Actor.userID());
    const value = await storage.getItem<number>(key);
    return value ?? 0;
  }

  export async function increamentFreeMessagesCount() {
    const currentCount = await freeMessagesCount();
    const key = cacheKey(Actor.userID());
    await storage.setItem(key, currentCount + 1, { ttl: CACHE_EXPIRY });
  }

  export async function canUseFreeMessages() {
    const currentCount = await freeMessagesCount();
    return currentCount < FREE_MESSAGES_PER_DAY;
  }

  // ---
}
