import z from "zod";
import { db } from "../db";
import { providerTable } from "./provider.sql";
import { Actor } from "../actor";
import { and, eq } from "drizzle-orm";

export namespace Provider {
  export const Entity = z.object({
    provider: z.enum(["openrouter"]),
    apiKey: z.string(),
    enabled: z.boolean(),
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
        set: { apiKey: input.apiKey, enabled: input.enabled },
      });
  }

  export async function list() {
    return db
      .select({
        apiKey: providerTable.apiKey,
        provider: providerTable.provider,
        enabled: providerTable.enabled,
      })
      .from(providerTable)
      .where(eq(providerTable.userId, Actor.userID()));
  }

  export async function apiKey() {
    return db
      .select({
        apiKey: providerTable.apiKey,
      })
      .from(providerTable)
      .where(
        and(
          eq(providerTable.userId, Actor.userID()),
          eq(providerTable.provider, "openrouter"),
          eq(providerTable.enabled, true),
        ),
      )
      .then((row) => row.at(0)?.apiKey);
  }
}
