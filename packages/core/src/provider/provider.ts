import z from "zod";
import { db } from "../drizzle";
import { providerTable } from "./provider.sql";
import { Actor } from "../actor";
import { eq } from "drizzle-orm";

export namespace Provider {
  export const Entity = z.object({
    provider: z.enum(["openrouter"]),
    apiKey: z.string(),
  });

  export type Entity = z.infer<typeof Entity>;

  export async function create(input: Entity) {
    await db
      .insert(providerTable)
      .values({
        ...input,
        userId: Actor.userID(),
      })
      .onConflictDoUpdate({
        target: [providerTable.provider, providerTable.userId],
        set: { apiKey: input.apiKey },
      });
  }

  export async function list() {
    return db
      .select({
        apiKey: providerTable.apiKey,
        provider: providerTable.provider,
      })
      .from(providerTable)
      .where(eq(providerTable.userId, Actor.userID()));
  }
}
