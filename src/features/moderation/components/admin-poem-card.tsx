import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  hidePoemAction,
  restorePoemAction,
} from "@/features/moderation/actions";
import { AdminReasonActionDialog } from "@/features/moderation/components/admin-reason-action-dialog";
import {
  MODERATION_STATUS_LABELS,
  POEM_STATUS_LABELS,
  formatModerationDate,
} from "@/features/moderation/formatters";
import { POEM_VISIBILITY_LABELS } from "@/features/posts/formatters";
import type { AdminPoemSummary } from "@/server/services/moderation";

type AdminPoemCardProps = Readonly<{
  poem: AdminPoemSummary;
}>;

/**
 * 管理后台诗作卡片（Server Component）：展示作者状态 / 治理状态 Badge 与作者信息。
 * 隐藏 / 恢复均通过 AdminReasonActionDialog 二次确认并填写原因。
 */
export function AdminPoemCard({ poem }: AdminPoemCardProps) {
  const hidden = poem.moderationStatus === "hidden";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-body-lg font-semibold text-foreground">
            <Link
              href={`/admin/poems/${poem.id}`}
              className="rounded-sm no-underline transition-colors hover:text-primary"
            >
              {poem.title}
            </Link>
          </h2>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-1.5">
          <Badge variant={poem.status === "published" ? "success" : "warning"}>
            {POEM_STATUS_LABELS[poem.status]}
          </Badge>
          <Badge variant={hidden ? "danger" : "neutral"}>
            {MODERATION_STATUS_LABELS[poem.moderationStatus]}
          </Badge>
          <Badge variant="neutral">
            {POEM_VISIBILITY_LABELS[poem.visibility]}
          </Badge>
          <span>更新于 {formatModerationDate(poem.updatedAt)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-1 text-label">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-subtle">作者</dt>
            <dd className="font-medium text-foreground">{poem.authorName}</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-subtle">邮箱</dt>
            <dd className="min-w-0 break-all font-medium text-foreground">
              {poem.authorEmail}
            </dd>
          </div>
        </dl>
        {poem.moderationReason ? (
          <div className="mt-3 rounded-md border border-danger/30 bg-danger-surface p-3 text-label text-danger">
            <p className="whitespace-pre-wrap">隐藏原因：{poem.moderationReason}</p>
            {poem.moderatedAt ? (
              <p className="mt-1">
                操作人：{poem.moderatorName ?? "已删除的管理员"} · 操作时间：
                {formatModerationDate(poem.moderatedAt)}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2">
        {hidden ? (
          <AdminReasonActionDialog
            action={restorePoemAction.bind(null, poem.id)}
            triggerLabel="恢复"
            title="恢复这首诗作？"
            description="恢复后，这首诗只有在作者状态为“已发布”时才会按作者选择的访问范围重新可见；如果仍是草稿则保持仅作者可见。"
            confirmLabel="确认恢复"
            confirmBusyLabel="正在恢复…"
          />
        ) : (
          <AdminReasonActionDialog
            action={hidePoemAction.bind(null, poem.id)}
            triggerLabel="隐藏"
            title="隐藏这首诗作？"
            description="隐藏后，这首诗会立即从首页、列表和详情消失；作者仍能看到原因，且保存、撤回或重新发布都不会解除隐藏。"
            confirmLabel="确认隐藏"
            confirmBusyLabel="正在隐藏…"
          />
        )}
      </CardFooter>
    </Card>
  );
}
