import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  hideCommentAction,
  restoreCommentAction,
} from "@/features/comments/admin-actions";
import { AdminReasonActionDialog } from "@/features/moderation/components/admin-reason-action-dialog";
import {
  MODERATION_STATUS_LABELS,
  formatModerationDateTime,
} from "@/features/moderation/formatters";
import type { AdminCommentSummary } from "@/server/services/comments";

export function AdminCommentCard({
  comment,
}: Readonly<{ comment: AdminCommentSummary }>) {
  const hidden = comment.moderationStatus === "hidden";
  const deleted = comment.deletedAt !== null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-body-lg font-semibold text-foreground">
            {comment.depth === 0 ? "根评论" : "一级回复"} · {comment.authorName}
          </h2>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <Badge variant={hidden ? "danger" : "neutral"}>
            {MODERATION_STATUS_LABELS[comment.moderationStatus]}
          </Badge>
          {deleted ? <Badge variant="neutral">作者已删除</Badge> : null}
          <span>{formatModerationDateTime(comment.createdAt)}</span>
          {comment.editedAt ? <span>· 已编辑</span> : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-label text-subtle">
          所属作品：
          <Link className="ml-1 underline" href={`/admin/poems/${comment.poemId}`}>
            《{comment.poemTitle}》
          </Link>
        </p>
        <p className="whitespace-pre-wrap break-words text-body text-foreground">
          {deleted ? "正文已由作者清空。" : comment.body}
        </p>
        {comment.moderationReason ? (
          <p className="rounded-md border border-danger/30 bg-danger-surface p-3 text-label text-danger">
            隐藏原因：{comment.moderationReason}
          </p>
        ) : null}
      </CardContent>
      {!deleted ? (
        <CardFooter>
          {hidden ? (
            <AdminReasonActionDialog
              action={restoreCommentAction.bind(null, comment.id)}
              triggerLabel="恢复"
              title="恢复这条评论？"
              description="恢复后，读者会重新看到评论正文；本次说明会写入审计日志。"
              confirmLabel="确认恢复"
              confirmBusyLabel="正在恢复…"
            />
          ) : (
            <AdminReasonActionDialog
              action={hideCommentAction.bind(null, comment.id)}
              triggerLabel="隐藏"
              title="隐藏这条评论？"
              description="其他读者会看到占位，作者仍能看到原文和处理原因；已有回复继续显示。"
              confirmLabel="确认隐藏"
              confirmBusyLabel="正在隐藏…"
            />
          )}
        </CardFooter>
      ) : null}
    </Card>
  );
}
