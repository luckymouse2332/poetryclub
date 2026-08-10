import "server-only";

import { randomBytes, randomUUID } from "node:crypto";

import {
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { hashInvitationCode } from "@/server/auth/invitation-plugin";
import { db } from "@/server/db";
import {
  adminAuditLog,
  adminGuard,
  invitation,
  poem,
  user,
} from "@/server/db/schema";
import {
  type AdminAuditAction,
  type AdminAuditTarget,
  writeAdminAudit,
} from "@/server/services/admin-audit";
import {
  createNotificationInTransaction,
  publishNotificationDispatch,
} from "@/server/services/notifications";
import type {
  InvitationInput,
  ModerationPoemListInput,
  ModerationUserListInput,
} from "@/server/validation/moderation";
import { MODERATION_PAGE_SIZE } from "@/server/validation/moderation";

const moderatorUser = alias(user, "moderator_user");
const poemCountsByAuthor = db
  .select({
    authorId: poem.authorId,
    draftCount:
      sql<number>`count(*) filter (where ${poem.status} = 'draft')::int`.as(
        "draft_count",
      ),
    publishedCount:
      sql<number>`count(*) filter (where ${poem.status} = 'published')::int`.as(
        "published_count",
      ),
  })
  .from(poem)
  .groupBy(poem.authorId)
  .as("poem_counts_by_author");

export class ModerationMutationError extends Error {
  constructor(
    public readonly code:
      | "not_found"
      | "invalid_transition"
      | "self_operation"
      | "last_active_admin"
      | "concurrent_conflict",
  ) {
    super(code);
    this.name = "ModerationMutationError";
  }
}

export type AdminPoemSummary = Readonly<{
  id: string;
  title: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  status: "draft" | "published";
  moderationStatus: "visible" | "hidden";
  moderationReason: string | null;
  moderatedAt: Date | null;
  moderatorName: string | null;
  updatedAt: Date;
  publishedAt: Date | null;
  visibility: "public" | "members_only";
}>;

export type AdminPoemDetail = AdminPoemSummary &
  Readonly<{
    body: string;
    context: string | null;
    occurredAt: Date | null;
    createdAt: Date;
  }>;

export type AdminUserSummary = Readonly<{
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  role: "member" | "admin";
  status: "active" | "suspended";
  suspensionReason: string | null;
  draftCount: number;
  publishedCount: number;
}>;

export type InvitationSummary = Readonly<{
  id: string;
  creatorName: string;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  disabledAt: Date | null;
  createdAt: Date;
}>;

export type AuditLogSummary = Readonly<{
  id: string;
  adminName: string;
  action: AdminAuditAction;
  targetType: AdminAuditTarget;
  targetId: string;
  reason: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}>;

export type AdminPaginatedResult<T> = Readonly<{
  items: ReadonlyArray<T>;
  page: number;
  pageCount: number;
  total: number;
}>;

function pageOffset(page: number): number {
  return (page - 1) * MODERATION_PAGE_SIZE;
}

function paginated<T>(items: T[], page: number, total: number): AdminPaginatedResult<T> {
  return {
    items,
    page,
    pageCount: Math.max(1, Math.ceil(total / MODERATION_PAGE_SIZE)),
    total,
  };
}

function combineConditions(conditions: SQL[]): SQL | undefined {
  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function listAdminPoems(
  input: ModerationPoemListInput,
): Promise<AdminPaginatedResult<AdminPoemSummary>> {
  const conditions: SQL[] = [];
  if (input.status) conditions.push(eq(poem.status, input.status));
  if (input.moderationStatus) {
    conditions.push(eq(poem.moderationStatus, input.moderationStatus));
  }
  if (input.authorId) conditions.push(eq(poem.authorId, input.authorId));
  if (input.q) {
    const pattern = `%${input.q}%`;
    conditions.push(
      or(
        ilike(poem.title, pattern),
        ilike(user.name, pattern),
        ilike(user.email, pattern),
      )!,
    );
  }
  const where = combineConditions(conditions);
  const base = db
    .select({ value: count() })
    .from(poem)
    .innerJoin(user, eq(poem.authorId, user.id))
    .where(where);
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: poem.id,
        title: poem.title,
        authorId: poem.authorId,
        authorName: user.name,
        authorEmail: user.email,
        status: poem.status,
        moderationStatus: poem.moderationStatus,
        moderationReason: poem.moderationReason,
        moderatedAt: poem.moderatedAt,
        moderatorName: moderatorUser.name,
        updatedAt: poem.updatedAt,
        publishedAt: poem.publishedAt,
        visibility: poem.visibility,
      })
      .from(poem)
      .innerJoin(user, eq(poem.authorId, user.id))
      .leftJoin(moderatorUser, eq(poem.moderatedBy, moderatorUser.id))
      .where(where)
      .orderBy(desc(poem.updatedAt), desc(poem.id))
      .limit(MODERATION_PAGE_SIZE)
      .offset(pageOffset(input.page)),
    base,
  ]);
  return paginated(rows, input.page, totalRows[0]?.value ?? 0);
}

export async function getAdminPoem(id: string): Promise<AdminPoemDetail | null> {
  const rows = await db
    .select({
      id: poem.id,
      title: poem.title,
      body: poem.body,
      context: poem.context,
      occurredAt: poem.occurredAt,
      createdAt: poem.createdAt,
      authorId: poem.authorId,
      authorName: user.name,
      authorEmail: user.email,
      status: poem.status,
      moderationStatus: poem.moderationStatus,
      moderationReason: poem.moderationReason,
      moderatedAt: poem.moderatedAt,
      moderatorName: moderatorUser.name,
      updatedAt: poem.updatedAt,
      publishedAt: poem.publishedAt,
      visibility: poem.visibility,
    })
    .from(poem)
    .innerJoin(user, eq(poem.authorId, user.id))
    .leftJoin(moderatorUser, eq(poem.moderatedBy, moderatorUser.id))
    .where(eq(poem.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function listAdminUsers(
  input: ModerationUserListInput,
): Promise<AdminPaginatedResult<AdminUserSummary>> {
  const conditions: SQL[] = [];
  if (input.role) conditions.push(eq(user.role, input.role));
  if (input.status) conditions.push(eq(user.status, input.status));
  if (input.q) {
    const pattern = `%${input.q}%`;
    conditions.push(or(ilike(user.name, pattern), ilike(user.email, pattern))!);
  }
  const where = combineConditions(conditions);
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        role: user.role,
        status: user.status,
        suspensionReason: user.suspensionReason,
        draftCount: sql<number>`coalesce(${poemCountsByAuthor.draftCount}, 0)`,
        publishedCount: sql<number>`coalesce(${poemCountsByAuthor.publishedCount}, 0)`,
      })
      .from(user)
      .leftJoin(
        poemCountsByAuthor,
        eq(poemCountsByAuthor.authorId, user.id),
      )
      .where(where)
      .orderBy(desc(user.createdAt), desc(user.id))
      .limit(MODERATION_PAGE_SIZE)
      .offset(pageOffset(input.page)),
    db.select({ value: count() }).from(user).where(where),
  ]);
  return paginated(rows, input.page, totalRows[0]?.value ?? 0);
}

export async function listInvitations(
  page: number,
): Promise<AdminPaginatedResult<InvitationSummary>> {
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: invitation.id,
        creatorName: user.name,
        maxUses: invitation.maxUses,
        usedCount: invitation.usedCount,
        expiresAt: invitation.expiresAt,
        disabledAt: invitation.disabledAt,
        createdAt: invitation.createdAt,
      })
      .from(invitation)
      .innerJoin(user, eq(invitation.createdBy, user.id))
      .orderBy(desc(invitation.createdAt), desc(invitation.id))
      .limit(MODERATION_PAGE_SIZE)
      .offset(pageOffset(page)),
    db.select({ value: count() }).from(invitation),
  ]);
  return paginated(rows, page, totalRows[0]?.value ?? 0);
}

export async function listAuditLogs(
  page: number,
): Promise<AdminPaginatedResult<AuditLogSummary>> {
  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: adminAuditLog.id,
        adminName: user.name,
        action: adminAuditLog.action,
        targetType: adminAuditLog.targetType,
        targetId: adminAuditLog.targetId,
        reason: adminAuditLog.reason,
        metadata: adminAuditLog.metadata,
        createdAt: adminAuditLog.createdAt,
      })
      .from(adminAuditLog)
      .innerJoin(user, eq(adminAuditLog.adminId, user.id))
      .orderBy(desc(adminAuditLog.createdAt), desc(adminAuditLog.id))
      .limit(MODERATION_PAGE_SIZE)
      .offset(pageOffset(page)),
    db.select({ value: count() }).from(adminAuditLog),
  ]);
  return paginated(rows, page, totalRows[0]?.value ?? 0);
}

export async function hidePoem(
  adminId: string,
  targetId: string,
  reason: string,
): Promise<boolean> {
  const result = await db.transaction(async (tx) => {
    const changed = await tx
      .update(poem)
      .set({
        moderationStatus: "hidden",
        moderationReason: reason,
        moderatedAt: new Date(),
        moderatedBy: adminId,
      })
      .where(and(eq(poem.id, targetId), eq(poem.moderationStatus, "visible")))
      .returning({
        id: poem.id,
        title: poem.title,
        authorId: poem.authorId,
        status: poem.status,
      });
    const row = changed[0];
    if (!row) {
      const current = await tx
        .select({ moderationStatus: poem.moderationStatus })
        .from(poem)
        .where(eq(poem.id, targetId))
        .limit(1);
      if (!current[0]) throw new ModerationMutationError("not_found");
      if (current[0].moderationStatus === "hidden") {
        return { changed: false, dispatch: null };
      }
      throw new ModerationMutationError("concurrent_conflict");
    }
    const auditId = await writeAdminAudit(tx, {
      adminId,
      action: "poem_hidden",
      targetType: "poem",
      targetId,
      reason,
      metadata: { authorId: row.authorId, authorStatus: row.status },
    });
    const dispatch = await createNotificationInTransaction(tx, {
      type: "moderation.poem_hidden",
      title: `作品《${row.title}》已被隐藏`,
      body: `管理员处理原因：${reason}`,
      href: `/account/poems/${targetId}/edit`,
      actorId: adminId,
      targetType: "poem",
      targetId,
      payload: { auditId },
      dedupeKey: `admin-audit:${auditId}`,
      recipientIds: [row.authorId],
    });
    return { changed: true, dispatch };
  });
  await publishNotificationDispatch(result.dispatch);
  return result.changed;
}

export async function restorePoem(
  adminId: string,
  targetId: string,
  reason: string,
): Promise<boolean> {
  const result = await db.transaction(async (tx) => {
    const changed = await tx
      .update(poem)
      .set({
        moderationStatus: "visible",
        moderationReason: null,
        moderatedAt: null,
        moderatedBy: null,
      })
      .where(and(eq(poem.id, targetId), eq(poem.moderationStatus, "hidden")))
      .returning({
        id: poem.id,
        title: poem.title,
        authorId: poem.authorId,
        status: poem.status,
      });
    const row = changed[0];
    if (!row) {
      const current = await tx
        .select({ moderationStatus: poem.moderationStatus })
        .from(poem)
        .where(eq(poem.id, targetId))
        .limit(1);
      if (!current[0]) throw new ModerationMutationError("not_found");
      if (current[0].moderationStatus === "visible") {
        return { changed: false, dispatch: null };
      }
      throw new ModerationMutationError("concurrent_conflict");
    }
    const auditId = await writeAdminAudit(tx, {
      adminId,
      action: "poem_restored",
      targetType: "poem",
      targetId,
      reason,
      metadata: { authorId: row.authorId, authorStatus: row.status },
    });
    const dispatch = await createNotificationInTransaction(tx, {
      type: "moderation.poem_restored",
      title: `作品《${row.title}》已恢复显示`,
      body: `管理员恢复说明：${reason}`,
      href: `/account/poems/${targetId}/edit`,
      actorId: adminId,
      targetType: "poem",
      targetId,
      payload: { auditId },
      dedupeKey: `admin-audit:${auditId}`,
      recipientIds: [row.authorId],
    });
    return { changed: true, dispatch };
  });
  await publishNotificationDispatch(result.dispatch);
  return result.changed;
}

async function lockAdminGuard(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<void> {
  const guard = await tx
    .select({ id: adminGuard.id })
    .from(adminGuard)
    .where(eq(adminGuard.id, 1))
    .for("update");
  if (!guard[0]) throw new ModerationMutationError("concurrent_conflict");
}

async function assertAnotherActiveAdmin(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<void> {
  const rows = await tx
    .select({ value: count() })
    .from(user)
    .where(and(eq(user.role, "admin"), eq(user.status, "active")));
  if ((rows[0]?.value ?? 0) <= 1) {
    throw new ModerationMutationError("last_active_admin");
  }
}

export async function setUserSuspended(
  adminId: string,
  targetId: string,
  reason: string,
  suspended: boolean,
): Promise<boolean> {
  if (adminId === targetId) throw new ModerationMutationError("self_operation");
  const result = await db.transaction(async (tx) => {
    await lockAdminGuard(tx);
    const targets = await tx
      .select({ role: user.role, status: user.status })
      .from(user)
      .where(eq(user.id, targetId))
      .for("update");
    const target = targets[0];
    if (!target) throw new ModerationMutationError("not_found");
    const desired = suspended ? "suspended" : "active";
    if (target.status === desired) {
      return { changed: false, dispatch: null };
    }
    if (suspended && target.role === "admin" && target.status === "active") {
      await assertAnotherActiveAdmin(tx);
    }
    const changed = await tx
      .update(user)
      .set(
        suspended
          ? {
              status: "suspended",
              suspensionReason: reason,
              suspendedAt: new Date(),
              suspendedBy: adminId,
              updatedAt: new Date(),
            }
          : {
              status: "active",
              suspensionReason: null,
              suspendedAt: null,
              suspendedBy: null,
              updatedAt: new Date(),
            },
      )
      .where(and(eq(user.id, targetId), eq(user.status, target.status)))
      .returning({ id: user.id });
    if (!changed[0]) throw new ModerationMutationError("concurrent_conflict");
    const auditId = await writeAdminAudit(tx, {
      adminId,
      action: suspended ? "user_suspended" : "user_restored",
      targetType: "user",
      targetId,
      reason,
      metadata: { previousStatus: target.status },
    });
    const dispatch = await createNotificationInTransaction(tx, {
      type: suspended
        ? "moderation.user_suspended"
        : "moderation.user_restored",
      title: suspended ? "你的账号已被禁用" : "你的账号已恢复正常",
      body: suspended
        ? `管理员处理原因：${reason}`
        : `管理员恢复说明：${reason}`,
      href: "/account",
      actorId: adminId,
      targetType: "user",
      targetId,
      payload: { auditId },
      dedupeKey: `admin-audit:${auditId}`,
      recipientIds: [targetId],
    });
    return { changed: true, dispatch };
  });
  await publishNotificationDispatch(result.dispatch);
  return result.changed;
}

export async function setUserRole(
  adminId: string,
  targetId: string,
  reason: string,
  role: "member" | "admin",
): Promise<boolean> {
  if (adminId === targetId && role === "member") {
    throw new ModerationMutationError("self_operation");
  }
  const result = await db.transaction(async (tx) => {
    await lockAdminGuard(tx);
    const targets = await tx
      .select({ role: user.role, status: user.status })
      .from(user)
      .where(eq(user.id, targetId))
      .for("update");
    const target = targets[0];
    if (!target) throw new ModerationMutationError("not_found");
    if (target.role === role) {
      return { changed: false, dispatch: null };
    }
    if (target.role === "admin" && target.status === "active" && role === "member") {
      await assertAnotherActiveAdmin(tx);
    }
    const changed = await tx
      .update(user)
      .set({ role, updatedAt: new Date() })
      .where(and(eq(user.id, targetId), eq(user.role, target.role)))
      .returning({ id: user.id });
    if (!changed[0]) throw new ModerationMutationError("concurrent_conflict");
    const auditId = await writeAdminAudit(tx, {
      adminId,
      action: role === "admin" ? "user_promoted" : "user_demoted",
      targetType: "user",
      targetId,
      reason,
      metadata: { previousRole: target.role, targetStatus: target.status },
    });
    const dispatch = await createNotificationInTransaction(tx, {
      type:
        role === "admin"
          ? "moderation.user_promoted"
          : "moderation.user_demoted",
      title:
        role === "admin"
          ? "你的账号已提升为管理员"
          : "你的账号已调整为普通成员",
      body: `管理员变更说明：${reason}`,
      href: "/account",
      actorId: adminId,
      targetType: "user",
      targetId,
      payload: { auditId },
      dedupeKey: `admin-audit:${auditId}`,
      recipientIds: [targetId],
    });
    return { changed: true, dispatch };
  });
  await publishNotificationDispatch(result.dispatch);
  return result.changed;
}

export async function createInvitation(
  adminId: string,
  input: InvitationInput,
): Promise<Readonly<{ id: string; code: string }>> {
  const id = randomUUID();
  const code = randomBytes(32).toString("base64url");
  await db.transaction(async (tx) => {
    await tx.insert(invitation).values({
      id,
      codeHash: hashInvitationCode(code),
      createdBy: adminId,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt,
    });
    await writeAdminAudit(tx, {
      adminId,
      action: "invitation_created",
      targetType: "invitation",
      targetId: id,
      reason: "创建邀请码",
      metadata: {
        maxUses: input.maxUses,
        expiresAt: input.expiresAt.toISOString(),
      },
    });
  });
  return { id, code };
}

export async function disableInvitation(
  adminId: string,
  targetId: string,
  reason: string,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const changed = await tx
      .update(invitation)
      .set({ disabledAt: new Date(), disabledBy: adminId })
      .where(
        and(
          eq(invitation.id, targetId),
          sql`${invitation.disabledAt} is null`,
          sql`${invitation.expiresAt} > now()`,
          sql`${invitation.usedCount} < ${invitation.maxUses}`,
        ),
      )
      .returning({ id: invitation.id, usedCount: invitation.usedCount });
    const row = changed[0];
    if (!row) {
      const current = await tx
        .select({ disabledAt: invitation.disabledAt })
        .from(invitation)
        .where(eq(invitation.id, targetId))
        .limit(1);
      if (!current[0]) throw new ModerationMutationError("not_found");
      if (current[0].disabledAt) return false;
      throw new ModerationMutationError("invalid_transition");
    }
    await writeAdminAudit(tx, {
      adminId,
      action: "invitation_disabled",
      targetType: "invitation",
      targetId,
      reason,
      metadata: { usedCount: row.usedCount },
    });
    return true;
  });
}
