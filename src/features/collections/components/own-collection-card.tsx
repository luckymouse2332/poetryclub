import { ManagementRow } from "@/components/layout/management-row";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollectionListActions } from "@/features/collections/components/collection-list-actions";
import { formatPoemDate } from "@/features/posts/formatters";
import type { OwnCollectionSummary } from "@/server/services/collections";

export function OwnCollectionCard({
  collection,
  suspended,
}: Readonly<{ collection: OwnCollectionSummary; suspended: boolean }>) {
  const published = collection.status === "published";
  const hidden = collection.moderationStatus === "hidden";
  return (
    <ManagementRow
      actions={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/account/collections/${collection.id}/edit`}>
              {suspended ? "查看" : "编辑"}
            </Link>
          </Button>
          {!suspended ? (
            <CollectionListActions
              id={collection.id}
              status={collection.status}
              publishedAt={collection.publishedAt}
              moderationStatus={collection.moderationStatus}
              availableItemCount={collection.availableItemCount}
              title={collection.title}
            />
          ) : null}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h2 className="min-w-0 font-serif text-body-lg font-medium break-words text-foreground">
          <Link
            href={`/account/collections/${collection.id}/edit`}
            className="hover:text-primary"
          >
            {collection.title}
          </Link>
        </h2>
        <Badge variant={published ? "success" : "warning"}>
          {published ? "已发布" : "草稿"}
        </Badge>
        {hidden ? <Badge variant="danger">已隐藏</Badge> : null}
      </div>
      <p className="mt-1.5 flex flex-wrap gap-x-2 text-label text-subtle">
        <span>
          {collection.visibility === "public" ? "公开" : "仅成员可见"}
        </span>
        <span aria-hidden="true">·</span>
        <span>{collection.itemCount} 篇</span>
        <span aria-hidden="true">·</span>
        <span>更新于 {formatPoemDate(collection.updatedAt)}</span>
      </p>
      {hidden && collection.moderationReason ? (
        <p className="mt-2 text-label break-words text-danger">
          隐藏原因：{collection.moderationReason}
        </p>
      ) : null}
      {!suspended && !published && collection.availableItemCount === 0 ? (
        <p className="mt-2 text-label text-subtle">
          先收录至少一篇当前可读的诗作才能发布。
        </p>
      ) : null}
    </ManagementRow>
  );
}
