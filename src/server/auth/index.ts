import "server-only";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { betterAuth } from "better-auth/minimal";

import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { getServerEnv } from "@/server/env";
import { invitationRegistrationPlugin } from "@/server/auth/invitation-plugin";

const env = getServerEnv();
const authOrigin = new URL(env.BETTER_AUTH_URL).origin;

export const auth = betterAuth({
  appName: "回中诗社",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    transaction: true,
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "member",
        input: false,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "active",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    deferSessionRefresh: true,
  },
  trustedOrigins: [authOrigin],
  advanced: {
    cookiePrefix: "poetryclub",
    useSecureCookies: authOrigin.startsWith("https://"),
  },
  plugins: [invitationRegistrationPlugin(), nextCookies()],
});
