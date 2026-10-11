import "server-only";
import { db } from "@/server/db";
import { announcement, notificationRecipient, user } from "@/server/db/schema";
import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, gt, sql, type SQL } from "drizzle-orm";
import { requireAdminMutation } from "@/server/policies/admin-mutation";
import { writeAdminAudit } from "@/server/services/admin-audit";
import { createNotificationInTransaction, publishNotificationDispatch } from "./delivery";
import { AnnouncementMutationError, type AnnouncementSummary, type AnnouncementPaginatedResult, type NotificationDispatch } from "./types";
import { NOTIFICATION_PAGE_SIZE, type AnnouncementAudience, type AnnouncementInput, type AnnouncementListInput } from "@/server/validation/notifications";

function announcementOffset(page: number): number {
  return (page - 1) * NOTIFICATION_PAGE_SIZE;
}

export async function listAnnouncements(
  input: AnnouncementListInput,
): Promise<AnnouncementPaginatedResult> {
  const where = input.status ? eq(announcement.status, input.status) : undefined;
  const [rows, totals] = await Promise.all([
    db
      .select({
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        href: announcement.href,
        audience: announcement.audience,
        status: announcement.status,
        creatorName: user.name,
        notificationId: announcement.notificationId,
        createdAt: announcement.createdAt,
        updatedAt: announcement.updatedAt,
        publishedAt: announcement.publishedAt,
      })
      .from(announcement)
      .innerJoin(user, eq(announcement.createdBy, user.id))
      .where(where)
      .orderBy(desc(announcement.updatedAt), desc(announcement.id))
      .limit(NOTIFICATION_PAGE_SIZE)
      .offset(announcementOffset(input.page)),
    db.select({ value: count() }).from(announcement).where(where),
  ]);
  const total = totals[0]?.value ?? 0;
  return {
    items: rows,
    page: input.page,
    pageCount: Math.max(1, Math.ceil(total / NOTIFICATION_PAGE_SIZE)),
    total,
  };
}

export async function getAnnouncement(
  id: string,
): Promise<AnnouncementSummary | null> {
  const rows = await db
    .select({
      id: announcement.id,
      title: announcement.title,
      body: announcement.body,
      href: announcement.href,
      audience: announcement.audience,
      status: announcement.status,
      creatorName: user.name,
      notificationId: announcement.notificationId,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt,
      publishedAt: announcement.publishedAt,
    })
    .from(announcement)
    .innerJoin(user, eq(announcement.createdBy, user.id))
    .where(eq(announcement.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createAnnouncementDraft(
  adminId: string,
  input: AnnouncementInput,
): Promise<string> {
  const id = randomUUID();
  await db.transaction(async (tx) => {
    await requireAdminMutation(tx, adminId);
    await tx.insert(announcement).values({
      id,
      createdBy: adminId,
      ...input,
    });
    await writeAdminAudit(tx, {
      adminId,
      action: "announcement_created",
      targetType: "announcement",
      targetId: id,
      reason: "创建系统公告草稿",
      metadata: { audience: input.audience },
    });
  });
  return id;
}

export async function updateAnnouncementDraft(
  adminId: string,
  id: string,
  input: AnnouncementInput,
): Promise<void> {
  await db.transaction(async (tx) => {
    await requireAdminMutation(tx, adminId);
    const updated = await tx
      .update(announcement)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(announcement.id, id), eq(announcement.status, "draft")))
      .returning({ id: announcement.id });
    if (!updated[0]) {
      const current = await tx
        .select({ status: announcement.status })
        .from(announcement)
        .where(eq(announcement.id, id))
        .limit(1);
      if (!current[0]) throw new AnnouncementMutationError("not_found");
      if (current[0].status === "published") {
        throw new AnnouncementMutationError("already_published");
      }
      throw new AnnouncementMutationError("concurrent_conflict");
    }
    await writeAdminAudit(tx, {
      adminId,
      action: "announcement_updated",
      targetType: "announcement",
      targetId: id,
      reason: "更新系统公告草稿",
      metadata: { audience: input.audience },
    });
  });
}

function announcementAudienceCondition(audience: AnnouncementAudience): SQL | undefined {
  if (audience === "active_accounts") return eq(user.status, "active");
  if (audience === "active_members") return and(eq(user.status, "active"), eq(user.role, "member"));
  if (audience === "active_admins") return and(eq(user.status, "active"), eq(user.role, "admin"));
}

async function publishSnapshot(dispatch: NotificationDispatch) {
  try {
    let after: string | undefined;
    for (;;) {
      const rows = await db.select({ id: notificationRecipient.userId }).from(notificationRecipient)
        .where(and(eq(notificationRecipient.notificationId, dispatch.notificationId), after ? gt(notificationRecipient.userId, after) : undefined))
        .orderBy(asc(notificationRecipient.userId)).limit(100);
      if (!rows.length) return;
      await publishNotificationDispatch({ ...dispatch, recipientIds: rows.map((row) => row.id) });
      after = rows.at(-1)!.id;
    }
  } catch { console.error("Notification snapshot wakeup failed; durable data is preserved"); }
}

export async function publishAnnouncement(
  adminId: string,
  id: string,
  input: AnnouncementInput,
): Promise<void> {
  const dispatch = await db.transaction(async (tx) => {
    await requireAdminMutation(tx, adminId);
    const rows = await tx
      .select({ status: announcement.status })
      .from(announcement)
      .where(eq(announcement.id, id))
      .for("update");
    const current = rows[0];
    if (!current) throw new AnnouncementMutationError("not_found");
    if (current.status === "published") {
      throw new AnnouncementMutationError("already_published");
    }

    const created = await createNotificationInTransaction(tx, {
      type: "system.announcement",
      title: input.title,
      body: input.body,
      href: input.href,
      actorId: adminId,
      targetType: "announcement",
      targetId: id,
      payload: { announcementId: id, audience: input.audience },
      dedupeKey: `announcement:${id}:published`,
      recipientIds: [],
    });
    // Snapshot in SQL: no unbounded user read or multi-value parameter list.
    await tx.insert(notificationRecipient).select(
      tx.select({ notificationId: sql<string>`${created.notificationId}`.as("notification_id"), userId: user.id, readAt: sql<Date | null>`null`.as("read_at") })
        .from(user).where(announcementAudienceCondition(input.audience)),
    );
    const [audience] = await tx.select({ value: count() }).from(notificationRecipient)
      .where(eq(notificationRecipient.notificationId, created.notificationId));
    const recipientCount = audience?.value ?? 0;
    if (!recipientCount) throw new AnnouncementMutationError("empty_audience");
    const publishedAt = new Date();
    const updated = await tx
      .update(announcement)
      .set({
        ...input,
        status: "published",
        notificationId: created.notificationId,
        publishedAt,
        updatedAt: publishedAt,
      })
      .where(and(eq(announcement.id, id), eq(announcement.status, "draft")))
      .returning({ id: announcement.id });
    if (!updated[0]) {
      throw new AnnouncementMutationError("concurrent_conflict");
    }
    await writeAdminAudit(tx, {
      adminId,
      action: "announcement_published",
      targetType: "announcement",
      targetId: id,
      reason: "发布系统公告",
      metadata: {
        audience: input.audience,
        notificationId: created.notificationId,
        recipientCount,
      },
    });
    return created;
  });
  await publishSnapshot(dispatch);
}
