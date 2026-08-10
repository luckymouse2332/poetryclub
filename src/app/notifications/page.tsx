import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { markAllNotificationsReadAction } from "@/features/notifications/actions";
import { NotificationListItem } from "@/features/notifications/components/notification-list-item";
import { NotificationPagination } from "@/features/notifications/components/notification-pagination";
import { toNotificationView } from "@/features/notifications/formatters";
import { requireExistingUser } from "@/server/policies/access";
import {
  getUnreadNotificationCount,
  listUserNotifications,
} from "@/server/services/notifications";
import { notificationListInputSchema } from "@/server/validation/notifications";

export const metadata: Metadata = { title: "通知" };

type NotificationsPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const currentUser = await requireExistingUser("/notifications");
  const query = await searchParams;
  const parsed = notificationListInputSchema.safeParse(query);
  if (!parsed.success) notFound();

  const [result, unreadCount] = await Promise.all([
    listUserNotifications(currentUser.id, parsed.data),
    getUnreadNotificationCount(currentUser.id),
  ]);
  if (result.total > 0 && parsed.data.page > result.pageCount) notFound();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="个人消息"
        title="通知"
        description={`这里保存治理结果和站内公告。当前有 ${unreadCount} 条未读通知。`}
        actions={
          unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <Button type="submit" variant="secondary">
                全部标为已读
              </Button>
            </form>
          ) : undefined
        }
      />

      <nav aria-label="通知筛选" className="mt-6 flex flex-wrap gap-3">
        <Button asChild variant={parsed.data.filter === "all" ? "primary" : "secondary"}>
          <Link href="/notifications">全部通知</Link>
        </Button>
        <Button asChild variant={parsed.data.filter === "unread" ? "primary" : "secondary"}>
          <Link href="/notifications?filter=unread">未读通知</Link>
        </Button>
      </nav>

      <Section className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <ul className="border-y border-border-subtle" aria-label="通知列表">
            {result.items.map((item) => (
              <NotificationListItem
                key={item.id}
                notification={toNotificationView(item)}
              />
            ))}
          </ul>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>
                {parsed.data.filter === "unread" ? "没有未读通知" : "还没有通知"}
              </EmptyTitle>
              <EmptyDescription>
                {parsed.data.filter === "unread"
                  ? "新的治理结果或系统公告会显示在这里。"
                  : "收到第一条站内消息后，会显示在这里。"}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
      <NotificationPagination
        page={result.page}
        pageCount={result.pageCount}
        filter={parsed.data.filter}
      />
    </PageContainer>
  );
}
