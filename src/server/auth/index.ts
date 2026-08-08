import "server-only";

import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { betterAuth } from "better-auth/minimal";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/password-policy.mjs";
import { invitationRegistrationPlugin } from "@/server/auth/invitation-plugin";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";
import { sendPasswordResetEmail } from "@/server/email/password-reset";
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
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      await sendPasswordResetEmail({ to: user.email, resetUrl: url });
    },
  },
  session: {
    deferSessionRefresh: true,
  },
  rateLimit: {
    enabled: env.NODE_ENV === "production",
    customRules: {
      "/change-password": { window: 15 * 60, max: 3 },
      "/request-password-reset": { window: 15 * 60, max: 3 },
      "/reset-password": { window: 15 * 60, max: 3 },
    },
  },
  trustedOrigins: [authOrigin],
  advanced: {
    cookiePrefix: "poetryclub",
    useSecureCookies: authOrigin.startsWith("https://"),
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for"],
    },
    backgroundTasks: {
      handler(promise) {
        // Better Auth attaches a rejection handler before calling this hook.
        // Keeping the provider request detached prevents account enumeration
        // through provider-dependent response timing in the Node server.
        void promise;
      },
    },
  },
  plugins: [invitationRegistrationPlugin(), nextCookies()],
});
