import "server-only";
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
    .set({ readAt: sql`coalesce(${notificationRecipient.readAt}, now())` })
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

