import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getLoginPath } from "@/lib/safe-redirect";
import { auth } from "@/server/auth";
import {
  type CurrentSession,
  type CurrentUser,
  toCurrentSession,
} from "@/server/auth/session-model";

async function readAuthSession(requestHeaders: Headers) {
  return auth.api.getSession({
    headers: requestHeaders,
    query: {
      disableCookieCache: true,
      disableRefresh: true,
    },
  });
}

async function readSession(requestHeaders: Headers): Promise<CurrentSession | null> {
  return toCurrentSession(await readAuthSession(requestHeaders));
}

export const getCurrentSession = cache(async (): Promise<CurrentSession | null> => {
  return readSession(await headers());
});

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return (await getCurrentSession())?.user ?? null;
}

export async function requireCurrentSession(
  returnTo: string = "/",
): Promise<CurrentSession> {
  const session = await getCurrentSession();

  if (!session) {
    redirect(getLoginPath(returnTo));
  }

  return session;
}

export async function requireCurrentUser(
  returnTo: string = "/",
): Promise<CurrentUser> {
  return (await requireCurrentSession(returnTo)).user;
}

export async function signOutCurrentSession(): Promise<void> {
  const requestHeaders = await headers();
  const currentSession = await readAuthSession(requestHeaders);

  if (currentSession) {
    try {
      const revoked = await auth.api.revokeSession({
        headers: requestHeaders,
        body: { token: currentSession.session.token },
      });

      if (!revoked.status) {
        throw new Error("Unable to revoke the current authentication session");
      }
    } catch (error) {
      // A concurrent sign-out may have won the race. Only treat the operation
      // as idempotent after an authoritative read proves the session is gone;
      // otherwise fail without clearing the Cookie so the user can retry.
      if (await readAuthSession(requestHeaders)) {
        throw error;
      }
    }
  }

  // The database session is now absent (or never existed). Better Auth expires
  // the signed Cookie; calling this again remains a stable no-op.
  const result = await auth.api.signOut({ headers: requestHeaders });
  if (!result.success) {
    throw new Error("Unable to invalidate the current authentication session");
  }
}
