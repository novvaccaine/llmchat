import z from "zod";
import { db } from "../db";
import { providerTable } from "./provider.sql";
import { Actor } from "../actor";
import { and, eq } from "drizzle-orm";

export namespace Provider {
  export const Entity = z.object({
    provider: z.enum(["openrouter"]),
    apiKey: z.string(),
    active: z.boolean(),
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
        set: { apiKey: input.apiKey, active: input.active },
      });
  }

  export async function list() {
    return db
      .select({
        apiKey: providerTable.apiKey,
        provider: providerTable.provider,
        active: providerTable.active,
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
          eq(providerTable.active, true),
        ),
      )
      .then((row) => row.at(0)?.apiKey);
  }
}
