import "server-only";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";

import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { getServerEnv } from "@/server/env";

const env = getServerEnv();
const authOrigin = new URL(env.BETTER_AUTH_URL).origin;

export const auth = betterAuth({
  appName: "回中诗社",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  trustedOrigins: [authOrigin],
  advanced: {
    cookiePrefix: "poetryclub",
    useSecureCookies: authOrigin.startsWith("https://"),
  },
});
