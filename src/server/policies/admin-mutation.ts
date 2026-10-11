import "server-only";

import { eq } from "drizzle-orm";
import { adminGuard, user } from "@/server/db/schema";
import type { DatabaseTransaction } from "@/server/db/types";
import { AccessControlError } from "@/server/policies/access";

/** All governance writes lock guard → verify actor → lock target.
 * Role/status changes share this guard, so authority cannot change mid-write.
 * This intentionally serializes low-volume administrative mutations.
 */
export async function requireAdminMutation(tx: DatabaseTransaction, actorId: string) {
  const guard = await tx.select({ id: adminGuard.id }).from(adminGuard)
    .where(eq(adminGuard.id, 1)).for("update");
  if (!guard[0]) throw new AccessControlError("forbidden");
  const [actor] = await tx.select({ role: user.role, status: user.status }).from(user)
    .where(eq(user.id, actorId)).limit(1);
  if (!actor) throw new AccessControlError("user_not_found");
  if (actor.status !== "active") throw new AccessControlError("account_suspended");
  if (actor.role !== "admin") throw new AccessControlError("forbidden");
}
