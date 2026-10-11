import "server-only";
import { randomUUID } from "node:crypto";
import { publishNotificationRealtime } from "./realtime";
import { db } from "@/server/db";
import { announcement, notification, notificationRecipient } from "@/server/db/schema";
import { and, count, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { getNotificationDefinition, getNotificationOpenHref } from "./definitions";
import { NotificationMutationError, type NotificationListItem, type NotificationPaginatedResult, type UserAnnouncementDetail } from "./types";
import { NOTIFICATION_PAGE_SIZE, NOTIFICATION_RECENT_LIMIT, type NotificationListInput } from "@/server/validation/notifications";

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

/** A read receipt only emits a wakeup after its durable update commits. */
async function publishInboxChange(userId: string): Promise<void> {
  await publishNotificationRealtime([userId], {
    id: randomUUID(), type: "inbox.changed", createdAt: new Date().toISOString(),
  });
}

export async function openUserNotification(userId: string, notificationId: string): Promise<string | null> {
  const [row] = await db.select({
    type: notification.type,
    targetType: notification.targetType,
    targetId: notification.targetId,
    href: notification.href,
  }).from(notificationRecipient)
    .innerJoin(notification, eq(notificationRecipient.notificationId, notification.id))
    .where(and(eq(notificationRecipient.userId, userId), eq(notificationRecipient.notificationId, notificationId)))
    .limit(1);
  if (!row) throw new NotificationMutationError("not_found");
  await markUserNotificationRead(userId, notificationId);
  return getNotificationOpenHref(row);
}

async function readAnnouncementRecipient(userId: string, announcementId: string) {
  const [row] = await db.select({
    id: announcement.id,
    title: announcement.title,
    body: announcement.body,
    href: announcement.href,
    createdAt: announcement.createdAt,
    publishedAt: announcement.publishedAt,
    notificationId: announcement.notificationId,
  }).from(announcement)
    .innerJoin(notificationRecipient, eq(notificationRecipient.notificationId, announcement.notificationId))
    .where(and(eq(announcement.id, announcementId), eq(announcement.status, "published"), eq(notificationRecipient.userId, userId)))
    .limit(1);
  if (!row?.notificationId || !row.publishedAt) return null;
  return { ...row, notificationId: row.notificationId, publishedAt: row.publishedAt };
}

/** Safe for Server Component rendering and link prefetch: no read receipt. */
export async function getUserAnnouncement(userId: string, announcementId: string): Promise<UserAnnouncementDetail | null> {
  const row = await readAnnouncementRecipient(userId, announcementId);
  if (!row) return null;
  return {
    id: row.id, title: row.title, body: row.body, href: row.href,
    createdAt: row.createdAt, publishedAt: row.publishedAt,
  };
}

export async function markUserAnnouncementRead(userId: string, announcementId: string): Promise<boolean> {
  const row = await readAnnouncementRecipient(userId, announcementId);
  if (!row) throw new NotificationMutationError("not_found");
  return markUserNotificationRead(userId, row.notificationId);
}

/** Compatibility entry for callers that explicitly open and acknowledge. */
export async function openUserAnnouncement(userId: string, announcementId: string): Promise<UserAnnouncementDetail | null> {
  const detail = await getUserAnnouncement(userId, announcementId);
  if (detail) await markUserAnnouncementRead(userId, announcementId);
  return detail;
}

export async function markUserNotificationRead(userId: string, notificationId: string): Promise<boolean> {
  const changed = await db.update(notificationRecipient).set({ readAt: sql`now()` })
    .where(and(eq(notificationRecipient.userId, userId), eq(notificationRecipient.notificationId, notificationId), isNull(notificationRecipient.readAt)))
    .returning({ notificationId: notificationRecipient.notificationId });
  if (changed[0]) {
    await publishInboxChange(userId);
    return true;
  }
  const [existing] = await db.select({ id: notificationRecipient.notificationId }).from(notificationRecipient)
    .where(and(eq(notificationRecipient.userId, userId), eq(notificationRecipient.notificationId, notificationId))).limit(1);
  if (!existing) throw new NotificationMutationError("not_found");
  return false;
}

export async function markAllUserNotificationsRead(userId: string): Promise<void> {
  // Return one boolean regardless of inbox size; never materialize every changed ID.
  const [result] = await db.execute<{ changed: boolean }>(sql`
    with changed as (
      update ${notificationRecipient} set read_at=now()
      where user_id=${userId} and read_at is null returning 1
    ) select exists(select 1 from changed) as changed
  `);
  if (result?.changed) await publishInboxChange(userId);
}
