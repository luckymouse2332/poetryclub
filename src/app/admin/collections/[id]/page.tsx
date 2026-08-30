import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  hideCollectionAction,
  restoreCollectionAction,
} from "@/features/collections/actions";
import { AdminReasonActionDialog } from "@/features/moderation/components/admin-reason-action-dialog";
import { formatModerationDateTime } from "@/features/moderation/formatters";
import { getAdminCollection } from "@/server/services/collections";
import { collectionIdSchema } from "@/server/validation/collections";

export const metadata: Metadata = { title: "特辑管理详情" };

export default async function AdminCollectionDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const parsed = collectionIdSchema.safeParse((await params).id);
  if (!parsed.success) notFound();
  const collection = await getAdminCollection(parsed.data);
  if (!collection) notFound();
  const hidden = collection.moderationStatus === "hidden";
  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="特辑治理"
        title={collection.title}
        description="管理员可以治理特辑本身，但不能代替整理者编辑简介、目录或发布状态。"
      />
      <div className="mt-6 flex flex-wrap gap-2">
        <Badge variant={collection.status === "published" ? "success" : "warning"}>
          {collection.status === "published" ? "已发布" : "草稿"}
        </Badge>
        <Badge variant={hidden ? "danger" : "neutral"}>{hidden ? "已隐藏" : "可见"}</Badge>
        <Badge variant="neutral">{collection.visibility === "public" ? "公开" : "仅成员可见"}</Badge>
      </div>
      <dl className="mt-6 space-y-2 text-label">
        <div className="flex gap-2"><dt className="text-subtle">整理者</dt><dd>{collection.ownerName}</dd></div>
        <div className="flex gap-2"><dt className="text-subtle">更新时间</dt><dd>{formatModerationDateTime(collection.updatedAt)}</dd></div>
      </dl>
      {collection.description ? (
        <section className="mt-8" aria-labelledby="admin-collection-description">
          <h2 id="admin-collection-description" className="text-section-title font-semibold">简介</h2>
          <p className="mt-3 whitespace-pre-wrap text-body text-foreground">{collection.description}</p>
        </section>
      ) : null}
      {collection.moderationReason ? (
        <Alert variant="danger" className="mt-6">
          <AlertDescription>隐藏原因：{collection.moderationReason}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-8">
        {hidden ? (
          <AdminReasonActionDialog
            action={restoreCollectionAction.bind(null, collection.id)}
            triggerLabel="恢复"
            title="恢复这个特辑？"
            description="已发布特辑会按整理者设置的访问范围重新出现。"
            confirmLabel="确认恢复"
            confirmBusyLabel="正在恢复…"
          />
        ) : (
          <AdminReasonActionDialog
            action={hideCollectionAction.bind(null, collection.id)}
            triggerLabel="隐藏"
            title="隐藏这个特辑？"
            description="特辑目录和连续阅读页面会立即不可见。"
            confirmLabel="确认隐藏"
            confirmBusyLabel="正在隐藏…"
          />
        )}
      </div>
    </PageContainer>
  );
}
