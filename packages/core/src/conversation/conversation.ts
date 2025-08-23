import z from "zod";
import { db } from "../db";
import { ulid } from "ulid";
import { conversationTable } from "./conversation.sql";
import { messageTable } from "../messsage/message.sql";
import { Actor } from "../actor";
import { and, asc, desc, eq, lte, sql, gt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { triggerStream } from "../utils";
import { AppError, errorCodes } from "../error";

export namespace Conversation {
  export const Entity = z.object({
    id: z.string(),
    title: z.string().nullable(),
    status: z.enum(["none", "streaming"]),
    lastMessageAt: z.string(),
    branchedFrom: z
      .object({
        id: z.string(),
        title: z.string().nullable(),
      })
      .nullable(),
  });

  export type Entity = z.infer<typeof Entity>;

  const MESSAGES_LIMIT = 50;

  export async function create(
    content: string,
    model: string,
    webSearch: boolean,
  ) {
    const conversationID = await db.transaction(async (tx) => {
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
        content: { text: content },
        role: "user",
        conversationID,
      });

      return conversationID;
    });

    await triggerStream(Actor.userID(), conversationID, model, webSearch);

    return conversationID;
  }

  export async function list() {
    const branchedFromTable = alias(conversationTable, "branchedFrom");
    const rows = await db
      .select({
        id: conversationTable.id,
        title: conversationTable.title,
        lastMessageAt: conversationTable.lastMessageAt,
        status: conversationTable.status,
        branchedFrom: {
          id: branchedFromTable.id,
          title: branchedFromTable.title,
        },
      })
      .from(conversationTable)
      .leftJoin(
        branchedFromTable,
        eq(conversationTable.branchedFrom, branchedFromTable.id),
      )
      .where(eq(conversationTable.userId, Actor.userID()))
      .orderBy(desc(conversationTable.lastMessageAt))
      .limit(MESSAGES_LIMIT); // TODO: pagination

    return rows.map((input) => ({
      ...input,
      lastMessageAt: input.lastMessageAt.toJSON(),
    }));
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
        ),
      )
      .returning({ id: conversationTable.id });

    return rows[0].id;
  }

  export async function remove(conversationID: string | undefined) {
    const conditions = [
      eq(conversationTable.userId, Actor.userID()),
      eq(conversationTable.status, "none"),
    ];

    if (conversationID) {
      conditions.push(eq(conversationTable.id, conversationID));
    }

    await db.delete(conversationTable).where(and(...conditions));
  }

  type BranchOffInput = {
    conversationID: string;
    messageID: string;
    model?: string;
    webSearch: boolean;
  };

  export async function branchOff(input: BranchOffInput) {
    // get the conversation title
    const result = await db.transaction(async (tx) => {
      const rows = await tx
        .select({
          title: conversationTable.title,
        })
        .from(conversationTable)
        .where(
          and(
            eq(conversationTable.id, input.conversationID),
            eq(conversationTable.status, "none"),
            eq(conversationTable.userId, Actor.userID()),
          ),
        );
      if (!rows.length) {
        throw new AppError(
          "not_found",
          errorCodes.notFound.RESOURCE_NOT_FOUND,
          "Conversation not found",
        );
      }
      const conversationTitle = rows[0].title;

      // get messages to copy into the new conversation
      const messagesToCopy = await tx
        .select()
        .from(messageTable)
        .where(
          and(
            eq(messageTable.conversationID, input.conversationID),
            lte(
              messageTable.createdAt,
              sql`(SELECT ${messageTable.createdAt} FROM ${messageTable} WHERE ${messageTable.id} = ${input.messageID})`,
            ),
          ),
        )
        .orderBy(asc(messageTable.createdAt));

      if (!messagesToCopy.length) {
        throw new AppError(
          "validation",
          errorCodes.validation.INVALID_STATE,
          "No messages found in conversation",
        );
      }

      // create new conversation
      const lastMessage = messagesToCopy[messagesToCopy.length - 1];
      const newConversation = (
        await tx
          .insert(conversationTable)
          .values({
            id: ulid(),
            userId: Actor.userID(),
            lastMessageAt: lastMessage.createdAt,
            title: conversationTitle,
            branchedFrom: input.conversationID,
          })
          .returning({ id: conversationTable.id })
      )[0];

      // copy all the messages into the new conversation
      await tx.insert(messageTable).values(
        messagesToCopy.map((message) => ({
          id: ulid(),
          conversationID: newConversation.id,
          content: message.content,
          role: message.role,
          model: message.model,
          createdAt: message.createdAt,
        })),
      );

      await tx
        .update(conversationTable)
        .set({
          lastMessageAt: new Date(),
        })
        .where(eq(conversationTable.id, newConversation.id));

      // If the last message in the conversation is from the user,
      // and the branching involves the same model, need to identify
      // the model by inspecting the *next* message
      let model = input.model;
      if (!model && lastMessage.role === "user") {
        const assistantMessage = await tx
          .select({ model: messageTable.model })
          .from(messageTable)
          .where(
            and(
              eq(messageTable.conversationID, input.conversationID),
              gt(messageTable.createdAt, lastMessage.createdAt),
              eq(messageTable.role, "assistant"),
            ),
          )
          .limit(1);

        if (!assistantMessage.length) {
          throw new AppError(
            "validation",
            errorCodes.validation.INVALID_STATE,
            "Assistant message is missing",
          );
        }

        model = assistantMessage[0].model!;
      }

      return {
        conversationID: newConversation.id,
        lastMessage,
        model,
      };
    });

    if (result.lastMessage.role === "user") {
      await triggerStream(
        Actor.userID(),
        result.conversationID,
        result.model!,
        input.webSearch,
      );
    }

    return result.conversationID;
  }
}
