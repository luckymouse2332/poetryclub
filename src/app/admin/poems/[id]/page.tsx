import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  hidePoemAction,
  restorePoemAction,
} from "@/features/moderation/actions";
import { AdminReasonActionDialog } from "@/features/moderation/components/admin-reason-action-dialog";
import {
  MODERATION_STATUS_LABELS,
  POEM_STATUS_LABELS,
  formatModerationDateTime,
} from "@/features/moderation/formatters";
import { POEM_VISIBILITY_LABELS } from "@/features/posts/formatters";
import { getAdminPoem } from "@/server/services/moderation";
import { uuidTargetIdSchema } from "@/server/validation/moderation";

export const metadata: Metadata = { title: "诗作管理详情" };

type AdminPoemDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function AdminPoemDetailPage({
  params,
}: AdminPoemDetailPageProps) {
  const parsedId = uuidTargetIdSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();
  const poem = await getAdminPoem(parsedId.data);
  if (!poem) notFound();
  const hidden = poem.moderationStatus === "hidden";

  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="诗作治理"
        title={poem.title}
        description="只读查看作品内容与治理信息；管理员不能代替作者编辑正文或改变作者发布状态。"
      />
      <div className="mt-6 flex flex-wrap gap-2">
        <Badge variant={poem.status === "published" ? "success" : "warning"}>
          {POEM_STATUS_LABELS[poem.status]}
        </Badge>
        <Badge variant={hidden ? "danger" : "neutral"}>
          {MODERATION_STATUS_LABELS[poem.moderationStatus]}
        </Badge>
        <Badge variant="neutral">
          {POEM_VISIBILITY_LABELS[poem.visibility]}
        </Badge>
      </div>
      <dl className="mt-6 space-y-2 text-label">
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-subtle">作者</dt>
          <dd className="font-medium">{poem.authorName}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-subtle">邮箱</dt>
          <dd className="break-all font-medium">{poem.authorEmail}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-subtle">更新时间</dt>
          <dd className="font-medium">{formatModerationDateTime(poem.updatedAt)}</dd>
        </div>
      </dl>
      {poem.moderationReason ? (
        <div className="mt-6 rounded-md border border-danger bg-danger-surface p-4 text-label text-danger">
          <p className="whitespace-pre-wrap">隐藏原因：{poem.moderationReason}</p>
          {poem.moderatedAt ? (
            <p className="mt-1">
              操作人：{poem.moderatorName ?? "已删除的管理员"} · 操作时间：
              {formatModerationDateTime(poem.moderatedAt)}
            </p>
          ) : null}
        </div>
      ) : null}
      <section className="mt-8" aria-labelledby="admin-poem-body">
        <h2 id="admin-poem-body" className="text-section-title font-semibold">
          正文
        </h2>
        <article className="mt-3 whitespace-pre-wrap rounded-lg border border-border-subtle bg-paper p-6 font-serif text-body shadow-card">
          {poem.body}
        </article>
      </section>
      {poem.context ? (
        <section className="mt-8" aria-labelledby="admin-poem-context">
          <h2 id="admin-poem-context" className="text-section-title font-semibold">
            创作背景
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-body text-subtle">{poem.context}</p>
        </section>
      ) : null}
      <div className="mt-8">
        {hidden ? (
          <AdminReasonActionDialog
            action={restorePoemAction.bind(null, poem.id)}
            triggerLabel="恢复"
            title="恢复这首诗作？"
            description="只有作者状态仍为已发布时，恢复后才会按作者选择的访问范围重新可见。"
            confirmLabel="确认恢复"
            confirmBusyLabel="正在恢复…"
          />
        ) : (
          <AdminReasonActionDialog
            action={hidePoemAction.bind(null, poem.id)}
            triggerLabel="隐藏"
            title="隐藏这首诗作？"
            description="隐藏后首页、诗作列表和作品详情会立即不可见。"
            confirmLabel="确认隐藏"
            confirmBusyLabel="正在隐藏…"
          />
        )}
      </div>
    </PageContainer>
  );
}
