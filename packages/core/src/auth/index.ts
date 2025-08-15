import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "./auth.sql";
import { env } from "../env";
import { customSession } from "better-auth/plugins";
import { Provider } from "../provider/provider";
import { Actor } from "../actor";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.userTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
    },
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5mins
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      return Actor.provide("user", { userID: session.userId }, async () => {
        const apiKey = await Provider.apiKey();
        return {
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
            apiKey,
          },
          session,
        };
      });
    }),
  ],
});
