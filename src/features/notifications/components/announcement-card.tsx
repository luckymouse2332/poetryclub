import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNotificationDate } from "@/features/notifications/formatters";
import type { AnnouncementSummary } from "@/server/services/notifications";

const AUDIENCE_LABELS = {
  all_accounts: "全部账号",
  active_accounts: "全部正常账号",
  active_members: "正常成员",
  active_admins: "正常管理员",
} as const;

export function AnnouncementCard({
  announcement,
}: Readonly<{ announcement: AnnouncementSummary }>) {
  const published = announcement.status === "published";
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={published ? "success" : "warning"}>
            {published ? "已发布" : "草稿"}
          </Badge>
          <Badge variant="neutral">
            {AUDIENCE_LABELS[announcement.audience]}
          </Badge>
        </div>
        <CardTitle className="mt-3 text-body-lg">{announcement.title}</CardTitle>
        <CardDescription>
          创建人：{announcement.creatorName} · 更新于 {formatNotificationDate(announcement.updatedAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-4 whitespace-pre-wrap text-body text-subtle">
          {announcement.body}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-3">
        {!published ? (
          <Button asChild variant="secondary">
            <Link href={`/admin/announcements/${announcement.id}/edit`}>
              编辑与发布
            </Link>
          </Button>
        ) : null}
        {announcement.href ? (
          <Button asChild variant="ghost">
            <Link href={announcement.href}>查看目标页面</Link>
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
