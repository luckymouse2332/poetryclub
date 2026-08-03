import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

/**
 * Invitation is transient registration input rather than a user field, so the
 * generated Better Auth client type does not expose it. Use the same-origin
 * Better Auth endpoint directly (its Origin/Host middleware still enforces
 * CSRF) and deliberately collapse every non-2xx response to one public error.
 * The response body is not returned to client UI, preserving the existing
 * generic duplicate-email behavior from `autoSignIn: false`.
 */
export async function registerWithInvitation(input: Readonly<{
  name: string;
  email: string;
  password: string;
  inviteCode: string;
}>): Promise<Readonly<{ error: boolean }>> {
  const response = await fetch("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return { error: !response.ok };
}
