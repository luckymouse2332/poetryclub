import "server-only";

import { randomUUID } from "node:crypto";

import type { DatabaseTransaction } from "@/server/db/types";
import { adminAuditLog } from "@/server/db/schema";

export type AdminAuditAction =
  | "poem_hidden"
  | "poem_restored"
  | "user_suspended"
  | "user_restored"
  | "user_promoted"
  | "user_demoted"
  | "invitation_created"
  | "invitation_disabled"
  | "announcement_created"
  | "announcement_updated"
  | "announcement_published"
  | "comment_hidden"
  | "comment_restored"
  | "collection_hidden"
  | "collection_restored";

export type AdminAuditTarget =
  | "poem"
  | "user"
  | "invitation"
  | "announcement"
  | "comment"
  | "collection";


export async function writeAdminAudit(
  tx: DatabaseTransaction,
  entry: Readonly<{
    adminId: string;
    action: AdminAuditAction;
    targetType: AdminAuditTarget;
    targetId: string;
    reason: string;
    metadata?: Record<string, unknown>;
  }>,
): Promise<string> {
  const id = randomUUID();
  await tx.insert(adminAuditLog).values({
    id,
    metadata: {},
    ...entry,
  });
  return id;
}
