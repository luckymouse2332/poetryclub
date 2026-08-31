import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  hideCollectionAction,
  restoreCollectionAction,
} from "@/features/collections/actions";
import { AdminReasonActionDialog } from "@/features/moderation/components/admin-reason-action-dialog";
import { formatModerationDate } from "@/features/moderation/formatters";
import type { AdminCollectionSummary } from "@/server/services/collections";

export function AdminCollectionCard({
  collection,
}: Readonly<{ collection: AdminCollectionSummary }>) {
  const hidden = collection.moderationStatus === "hidden";
  return (
    <article className="grid gap-4 border-b border-border-subtle py-5 first:border-t md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <h2 className="font-serif text-body-lg text-foreground">
          <Link href={`/admin/collections/${collection.id}`} className="hover:text-seal-foreground">
            {collection.title}
          </Link>
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-label text-subtle">
          <Badge variant={collection.status === "published" ? "success" : "warning"}>
            {collection.status === "published" ? "已发布" : "草稿"}
          </Badge>
          <Badge variant={hidden ? "danger" : "neutral"}>{hidden ? "已隐藏" : "可见"}</Badge>
          <Badge variant="neutral">{collection.visibility === "public" ? "公开" : "仅成员可见"}</Badge>
          <span>整理：{collection.ownerName}</span>
          <span>更新于 {formatModerationDate(collection.updatedAt)}</span>
        </div>
        {collection.moderationReason ? (
          <p className="mt-2 line-clamp-2 whitespace-pre-wrap text-label text-danger">
            隐藏原因：{collection.moderationReason}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        {hidden ? (
          <AdminReasonActionDialog
            action={restoreCollectionAction.bind(null, collection.id)}
            triggerLabel="恢复"
            title="恢复这个特辑？"
            description="恢复后，已发布特辑会按整理者设置的访问范围重新出现。"
            confirmLabel="确认恢复"
            confirmBusyLabel="正在恢复…"
          />
        ) : (
          <AdminReasonActionDialog
            action={hideCollectionAction.bind(null, collection.id)}
            triggerLabel="隐藏"
            title="隐藏这个特辑？"
            description="隐藏后，特辑目录和连续阅读页面会立即不可见，收录诗作本身不受影响。"
            confirmLabel="确认隐藏"
            confirmBusyLabel="正在隐藏…"
          />
        )}
      </div>
    </article>
  );
}
