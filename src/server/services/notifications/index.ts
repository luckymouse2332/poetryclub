import "server-only";

import { randomUUID } from "node:crypto";

import {
  and,
  count,
  desc,
  eq,
  isNull,
  type SQL,
} from "drizzle-orm";

import { db } from "@/server/db";
import {
  announcement,
  notification,
  notificationRecipient,
  user,
} from "@/server/db/schema";
import {
  type DatabaseTransaction,
  writeAdminAudit,
} from "@/server/services/admin-audit";
import {
  getNotificationDefinition,
  getNotificationOpenHref,
  type KnownNotificationType,
} from "@/server/services/notifications/definitions";
import { publishNotificationRealtime } from "@/server/services/notifications/realtime";
import {
  NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_RECENT_LIMIT,
  type AnnouncementAudience,
  type AnnouncementInput,
  type AnnouncementListInput,
  type NotificationListInput,
} from "@/server/validation/notifications";

export class NotificationMutationError extends Error {
  constructor(public readonly code: "not_found" | "forbidden") {
    super(code);
    this.name = "NotificationMutationError";
  }
}

export class AnnouncementMutationError extends Error {
  constructor(
    public readonly code:
      | "not_found"
      | "already_published"
      | "concurrent_conflict"
      | "empty_audience",
  ) {
    super(code);
    this.name = "AnnouncementMutationError";
  }
}

export type NotificationListItem = Readonly<{
  id: string;
  type: string;
  category: string;
  label: string;
  title: string;
  body: string;
  href: string | null;
  targetType: string | null;
  targetId: string | null;
  createdAt: Date;
  readAt: Date | null;
}>;

export type NotificationPaginatedResult = Readonly<{
  items: ReadonlyArray<NotificationListItem>;
  page: number;
  pageCount: number;
  total: number;
}>;

export type AnnouncementSummary = Readonly<{
  id: string;
  title: string;
  body: string;
  href: string | null;
  audience: AnnouncementAudience;
  status: "draft" | "published";
  creatorName: string;
  notificationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}>;

export type UserAnnouncementDetail = Readonly<{
  id: string;
  title: string;
  body: string;
  href: string | null;
  createdAt: Date;
  publishedAt: Date;
}>;

export type AnnouncementPaginatedResult = Readonly<{
  items: ReadonlyArray<AnnouncementSummary>;
  page: number;
  pageCount: number;
  total: number;
}>;

export type NotificationDispatch = Readonly<{
  notificationId: string;
  type: string;
  createdAt: Date;
  recipientIds: ReadonlyArray<string>;
}>;

export type CreateNotificationInput = Readonly<{
  type: KnownNotificationType | (string & {});
  title: string;
  body: string;
  href?: string | null;
  actorId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  payload?: Record<string, unknown>;
  dedupeKey: string;
  recipientIds: ReadonlyArray<string>;
}>;

function notificationOffset(page: number): number {
  return (page - 1) * NOTIFICATION_PAGE_SIZE;
}

function mapNotificationRow(row: {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string | null;
  targetType: string | null;
  targetId: string | null;
  createdAt: Date;
  readAt: Date | null;
}): NotificationListItem {
  const definition = getNotificationDefinition(row.type);
  return {
    ...row,
    href: getNotificationOpenHref(row),
    ...definition,
  };
}

export async function createNotificationInTransaction(
  tx: DatabaseTransaction,
  input: CreateNotificationInput,
): Promise<NotificationDispatch> {
  const id = randomUUID();
  const inserted = await tx
    .insert(notification)
    .values({
      id,
      type: input.type,
      title: input.title,
      body: input.body,
      href: input.href ?? null,
      actorId: input.actorId ?? null,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      payload: input.payload ?? {},
      dedupeKey: input.dedupeKey,
    })
    .onConflictDoNothing({ target: notification.dedupeKey })
    .returning({
      id: notification.id,
      type: notification.type,
      createdAt: notification.createdAt,
    });

  const event =
    inserted[0] ??
    (
      await tx
        .select({
          id: notification.id,
          type: notification.type,
          createdAt: notification.createdAt,
        })
        .from(notification)
        .where(eq(notification.dedupeKey, input.dedupeKey))
        .limit(1)
    )[0];

  if (!event) {
    throw new Error("Unable to create or recover notification event");
  }

  const recipientIds = [...new Set(input.recipientIds)];
  const insertedRecipients =
    recipientIds.length === 0
      ? []
      : await tx
          .insert(notificationRecipient)
          .values(
            recipientIds.map((userId) => ({
              notificationId: event.id,
              userId,
            })),
          )
          .onConflictDoNothing()
          .returning({ userId: notificationRecipient.userId });

  return {
    notificationId: event.id,
    type: event.type,
    createdAt: event.createdAt,
    recipientIds: insertedRecipients.map((row) => row.userId),
  };
}

export async function publishNotificationDispatch(
  dispatch: NotificationDispatch | null,
): Promise<void> {
  if (!dispatch || dispatch.recipientIds.length === 0) return;
  await publishNotificationRealtime(dispatch.recipientIds, {
    id: dispatch.notificationId,
    type: dispatch.type,
    createdAt: dispatch.createdAt.toISOString(),
  });
}

function userNotificationCondition(
  userId: string,
  input: NotificationListInput,
): SQL {
  return input.filter === "unread"
    ? and(
        eq(notificationRecipient.userId, userId),
        isNull(notificationRecipient.readAt),
      )!
    : eq(notificationRecipient.userId, userId);
}

export async function listUserNotifications(
  userId: string,
  input: NotificationListInput,
): Promise<NotificationPaginatedResult> {
  const where = userNotificationCondition(userId, input);
  const [rows, totals] = await Promise.all([
    db
      .select({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        href: notification.href,
        targetType: notification.targetType,
        targetId: notification.targetId,
        createdAt: notification.createdAt,
        readAt: notificationRecipient.readAt,
      })
      .from(notificationRecipient)
      .innerJoin(
        notification,
        eq(notificationRecipient.notificationId, notification.id),
      )
      .where(where)
      .orderBy(desc(notification.createdAt), desc(notification.id))
      .limit(NOTIFICATION_PAGE_SIZE)
      .offset(notificationOffset(input.page)),
    db
      .select({ value: count() })
      .from(notificationRecipient)
      .where(where),
  ]);
  const total = totals[0]?.value ?? 0;
  return {
    items: rows.map(mapNotificationRow),
    page: input.page,
    pageCount: Math.max(1, Math.ceil(total / NOTIFICATION_PAGE_SIZE)),
    total,
  };
}

export async function listRecentNotifications(
  userId: string,
): Promise<ReadonlyArray<NotificationListItem>> {
  const rows = await db
    .select({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      href: notification.href,
      targetType: notification.targetType,
      targetId: notification.targetId,
      createdAt: notification.createdAt,
      readAt: notificationRecipient.readAt,
    })
    .from(notificationRecipient)
    .innerJoin(
      notification,
      eq(notificationRecipient.notificationId, notification.id),
    )
    .where(eq(notificationRecipient.userId, userId))
    .orderBy(desc(notification.createdAt), desc(notification.id))
    .limit(NOTIFICATION_RECENT_LIMIT);
  return rows.map(mapNotificationRow);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(notificationRecipient)
    .where(
      and(
        eq(notificationRecipient.userId, userId),
        isNull(notificationRecipient.readAt),
      ),
    );
  return rows[0]?.value ?? 0;
}

export async function openUserNotification(
  userId: string,
  notificationId: string,
): Promise<string | null> {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({
        type: notification.type,
        targetType: notification.targetType,
        targetId: notification.targetId,
        href: notification.href,
      })
      .from(notificationRecipient)
      .innerJoin(
        notification,
        eq(notificationRecipient.notificationId, notification.id),
      )
      .where(
        and(
          eq(notificationRecipient.userId, userId),
          eq(notificationRecipient.notificationId, notificationId),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (!row) throw new NotificationMutationError("not_found");
    await tx
      .update(notificationRecipient)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationRecipient.userId, userId),
          eq(notificationRecipient.notificationId, notificationId),
          isNull(notificationRecipient.readAt),
        ),
      );
    return getNotificationOpenHref(row);
  });
}

export async function openUserAnnouncement(
  userId: string,
  announcementId: string,
): Promise<UserAnnouncementDetail | null> {
  return db.transaction(async (tx) => {
    const rows = await tx
      .select({
        id: announcement.id,
        title: announcement.title,
        body: announcement.body,
        href: announcement.href,
        createdAt: announcement.createdAt,
        publishedAt: announcement.publishedAt,
        notificationId: announcement.notificationId,
      })
      .from(announcement)
      .innerJoin(
        notificationRecipient,
        eq(notificationRecipient.notificationId, announcement.notificationId),
      )
      .where(
        and(
          eq(announcement.id, announcementId),
          eq(announcement.status, "published"),
          eq(notificationRecipient.userId, userId),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (!row || !row.notificationId || !row.publishedAt) return null;

    await tx
      .update(notificationRecipient)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationRecipient.notificationId, row.notificationId),
          eq(notificationRecipient.userId, userId),
          isNull(notificationRecipient.readAt),
        ),
      );

    return {
      id: row.id,
      title: row.title,
      body: row.body,
      href: row.href,
      createdAt: row.createdAt,
      publishedAt: row.publishedAt,
    };
  });
}

export async function markUserNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const updated = await db
    .update(notificationRecipient)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notificationRecipient.userId, userId),
        eq(notificationRecipient.notificationId, notificationId),
      ),
    )
    .returning({ notificationId: notificationRecipient.notificationId });
  if (!updated[0]) throw new NotificationMutationError("not_found");
}

export async function markAllUserNotificationsRead(userId: string): Promise<void> {
  await db
    .update(notificationRecipient)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notificationRecipient.userId, userId),
        isNull(notificationRecipient.readAt),
      ),
    );
}

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

async function listAnnouncementRecipientIds(
  tx: DatabaseTransaction,
  audience: AnnouncementAudience,
): Promise<string[]> {
  let where: SQL | undefined;
  if (audience === "active_accounts") {
    where = eq(user.status, "active");
  } else if (audience === "active_members") {
    where = and(eq(user.status, "active"), eq(user.role, "member"));
  } else if (audience === "active_admins") {
    where = and(eq(user.status, "active"), eq(user.role, "admin"));
  }
  const rows = await tx.select({ id: user.id }).from(user).where(where);
  return rows.map((row) => row.id);
}

export async function publishAnnouncement(
  adminId: string,
  id: string,
): Promise<void> {
  const dispatch = await db.transaction(async (tx) => {
    const rows = await tx
      .select({
        title: announcement.title,
        body: announcement.body,
        href: announcement.href,
        audience: announcement.audience,
        status: announcement.status,
      })
      .from(announcement)
      .where(eq(announcement.id, id))
      .for("update");
    const current = rows[0];
    if (!current) throw new AnnouncementMutationError("not_found");
    if (current.status === "published") {
      throw new AnnouncementMutationError("already_published");
    }

    const recipientIds = await listAnnouncementRecipientIds(
      tx,
      current.audience,
    );
    if (recipientIds.length === 0) {
      throw new AnnouncementMutationError("empty_audience");
    }

    const created = await createNotificationInTransaction(tx, {
      type: "system.announcement",
      title: current.title,
      body: current.body,
      href: current.href,
      actorId: adminId,
      targetType: "announcement",
      targetId: id,
      payload: { announcementId: id, audience: current.audience },
      dedupeKey: `announcement:${id}:published`,
      recipientIds,
    });
    const publishedAt = new Date();
    const updated = await tx
      .update(announcement)
      .set({
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
        audience: current.audience,
        notificationId: created.notificationId,
        recipientCount: recipientIds.length,
      },
    });
    return created;
  });
  await publishNotificationDispatch(dispatch);
}
