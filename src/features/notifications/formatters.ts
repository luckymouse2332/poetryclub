import type { NotificationListItem } from "@/server/services/notifications";

const notificationClockFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const notificationDateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function startOfLocalDay(value: Date): number {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
}

export function formatNotificationDate(
  value: Date,
  now = new Date(),
): string {
  const elapsed = now.getTime() - value.getTime();
  if (elapsed >= 0 && elapsed < 60_000) return "刚刚";
  if (elapsed >= 60_000 && elapsed < 3_600_000) {
    return `${Math.floor(elapsed / 60_000)} 分钟前`;
  }

  const dayDifference = Math.floor(
    (startOfLocalDay(now) - startOfLocalDay(value)) / 86_400_000,
  );
  if (dayDifference === 0) {
    return `今天 ${notificationClockFormatter.format(value)}`;
  }
  if (dayDifference === 1) {
    return `昨天 ${notificationClockFormatter.format(value)}`;
  }
  if (value.getFullYear() === now.getFullYear()) {
    return `${value.getMonth() + 1}月${value.getDate()}日 ${notificationClockFormatter.format(value)}`;
  }
  return notificationDateTimeFormatter.format(value);
}

export type NotificationView = Readonly<{
  id: string;
  label: string;
  title: string;
  body: string;
  href: string | null;
  createdAtLabel: string;
  createdAtISO: string;
  unread: boolean;
}>;

export function toNotificationView(
  item: NotificationListItem,
): NotificationView {
  return {
    id: item.id,
    label: item.label,
    title: item.title,
    body: item.body,
    href: item.href,
    createdAtLabel: formatNotificationDate(item.createdAt),
    createdAtISO: item.createdAt.toISOString(),
    unread: item.readAt === null,
  };
}
