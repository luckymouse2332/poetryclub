import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPoemDate } from "@/features/posts/formatters";
import { PoemActions } from "@/features/posts/components/poem-actions";
import type { OwnPoemSummary } from "@/server/services/poems";

type OwnPoemCardProps = Readonly<{
  poem: OwnPoemSummary;
  /** 账号被禁用时进入只读：不渲染发布 / 撤回 / 删除操作，仅保留查看入口。 */
  suspended?: boolean;
}>;

const STATUS_LABEL = {
  draft: "草稿",
  published: "已发布",
} as const;

const STATUS_VARIANT = {
  draft: "warning",
  published: "success",
} as const;

/** 我的诗作列表卡片：状态、更新/首次发布时间、编辑入口与状态操作。 */
export function OwnPoemCard({ poem, suspended = false }: OwnPoemCardProps) {
  const publishedLabel = poem.publishedAt
    ? `首次发布 ${formatPoemDate(poem.publishedAt)}`
    : "尚未发布";

  const hidden = poem.moderationStatus === "hidden";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-body-lg font-semibold text-foreground">
            <Link
              href={`/account/poems/${poem.id}/edit`}
              className="rounded-sm no-underline transition-colors hover:text-primary"
            >
              {poem.title}
            </Link>
          </h2>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-1.5">
          <Badge variant={STATUS_VARIANT[poem.status]}>
            {STATUS_LABEL[poem.status]}
          </Badge>
          <Badge variant="neutral">
            {poem.visibility === "public" ? "公开" : "仅成员可见"}
          </Badge>
          {hidden ? <Badge variant="danger">管理员已隐藏</Badge> : null}
          <span>
            更新于 {formatPoemDate(poem.updatedAt)} · {publishedLabel}
          </span>
        </CardDescription>
      </CardHeader>
      {hidden && poem.moderationReason ? (
        <CardContent>
          <p className="whitespace-pre-wrap rounded-md border border-danger/30 bg-danger-surface p-3 text-label text-danger">
            隐藏原因：{poem.moderationReason}
          </p>
        </CardContent>
      ) : null}
      <CardFooter className="flex flex-wrap items-center gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/account/poems/${poem.id}/edit`}>
            {suspended ? "查看" : "编辑"}
          </Link>
        </Button>
        {!suspended ? (
          <PoemActions
            id={poem.id}
            status={poem.status}
            moderationStatus={poem.moderationStatus}
            compact
          />
        ) : null}
      </CardFooter>
    </Card>
  );
}
