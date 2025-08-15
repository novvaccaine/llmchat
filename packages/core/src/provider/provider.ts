import z from "zod";
import { db } from "../db";
import { providerTable } from "./provider.sql";
import { Actor } from "../actor";
import { and, eq } from "drizzle-orm";
import { storage } from "../storage";

export namespace Provider {
  export const Entity = z.object({
    provider: z.enum(["openrouter"]),
    apiKey: z.string(),
    enabled: z.boolean(),
  });

  export type Entity = z.infer<typeof Entity>;

  const cacheKey = (userID: string) => `apiKey:${userID}:openrouter`;

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
      })
      .then(() => {
        if (!input.enabled) {
          const key = cacheKey(Actor.userID());
          storage.removeItem(key);
        }
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
    const key = cacheKey(Actor.userID());
    const value = await storage.getItem<string>(key);
    if (value) {
      return value;
    }

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
      .then(async (row) => {
        const apiKey = row.at(0)?.apiKey;
        if (apiKey) {
          storage.setItem(key, apiKey);
        }
        return apiKey;
      });
  }
}
