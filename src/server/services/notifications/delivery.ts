import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { notification, notificationRecipient } from "@/server/db/schema";
import type { DatabaseTransaction } from "@/server/db/types";
import type { CreateNotificationInput, NotificationDispatch } from "./types";
import { publishNotificationRealtime } from "./realtime";

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

