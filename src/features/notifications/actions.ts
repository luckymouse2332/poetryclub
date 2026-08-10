"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireExistingUser } from "@/server/policies/access";
import {
  markAllUserNotificationsRead,
  markUserNotificationRead,
  NotificationMutationError,
  openUserNotification,
} from "@/server/services/notifications";
import { notificationIdSchema } from "@/server/validation/notifications";

function revalidateNotifications(): void {
  revalidatePath("/", "layout");
  revalidatePath("/notifications");
}

export async function openNotificationAction(
  notificationId: string,
  _formData: FormData,
): Promise<void> {
  void _formData;
  const currentUser = await requireExistingUser("/notifications");
  const parsedId = notificationIdSchema.safeParse(notificationId);
  if (!parsedId.success) redirect("/notifications");

  let href: string | null;
  try {
    href = await openUserNotification(currentUser.id, parsedId.data);
  } catch (error) {
    if (error instanceof NotificationMutationError) {
      redirect("/notifications");
    }
    throw error;
  }
  revalidateNotifications();
  redirect(href ?? "/notifications");
}

export async function markNotificationReadAction(
  notificationId: string,
  _formData: FormData,
): Promise<void> {
  void _formData;
  const currentUser = await requireExistingUser("/notifications");
  const parsedId = notificationIdSchema.safeParse(notificationId);
  if (!parsedId.success) return;
  try {
    await markUserNotificationRead(currentUser.id, parsedId.data);
  } catch (error) {
    if (!(error instanceof NotificationMutationError)) throw error;
  }
  revalidateNotifications();
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const currentUser = await requireExistingUser("/notifications");
  await markAllUserNotificationsRead(currentUser.id);
  revalidateNotifications();
}
