import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import type { DatabaseTransaction } from "@/server/db/types";
import { AccessControlError } from "./access";

/** Lock writer before content. Suspension waits until an authorized write commits. */
export async function requireActiveWriter(tx: DatabaseTransaction, actorId: string): Promise<void> {
  const [actor] = await tx.select({ status: user.status }).from(user)
    .where(eq(user.id, actorId)).for("share");
  if (!actor) throw new AccessControlError("user_not_found");
  if (actor.status !== "active") throw new AccessControlError("account_suspended");
}

export async function withActiveWriter<T>(
  actorId: string,
  mutation: (tx: DatabaseTransaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await requireActiveWriter(tx, actorId);
    return mutation(tx);
  });
}
