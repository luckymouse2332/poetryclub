import "server-only";

import { eq } from "drizzle-orm";

import { requireCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";

export type AuthoritativeUser = Readonly<{
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  role: "member" | "admin";
  status: "active" | "suspended";
  suspensionReason: string | null;
}>;

export class AccessControlError extends Error {
  constructor(
    public readonly code:
      | "account_suspended"
      | "forbidden"
      | "user_not_found",
  ) {
    super(code);
    this.name = "AccessControlError";
  }
}

export async function getAuthoritativeUser(
  id: string,
): Promise<AuthoritativeUser | null> {
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      role: user.role,
      status: user.status,
      suspensionReason: user.suspensionReason,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function requireActiveUser(
  returnTo = "/",
): Promise<AuthoritativeUser> {
  const sessionUser = await requireCurrentUser(returnTo);
  const currentUser = await getAuthoritativeUser(sessionUser.id);
  if (!currentUser) throw new AccessControlError("user_not_found");
  if (currentUser.status !== "active") {
    throw new AccessControlError("account_suspended");
  }
  return currentUser;
}

export async function requireAdmin(returnTo = "/admin"): Promise<AuthoritativeUser> {
  const currentUser = await requireActiveUser(returnTo);
  if (currentUser.role !== "admin") throw new AccessControlError("forbidden");
  return currentUser;
}
