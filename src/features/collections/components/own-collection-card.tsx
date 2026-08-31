import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollectionActions } from "@/features/collections/components/collection-actions";
import { formatPoemDate } from "@/features/posts/formatters";
import type { OwnCollectionSummary } from "@/server/services/collections";

export function OwnCollectionCard({
  collection,
  suspended,
}: Readonly<{ collection: OwnCollectionSummary; suspended: boolean }>) {
  const published = collection.status === "published";
  const hidden = collection.moderationStatus === "hidden";
  return (
    <article className="grid gap-4 border-b border-border-subtle py-5 first:border-t xl:grid-cols-[minmax(12rem,1.5fr)_8rem_9rem_7rem_11rem_auto] xl:items-center xl:gap-5">
      <div className="min-w-0">
        <h2 className="truncate font-serif text-body-lg text-foreground">
          <Link href={`/account/collections/${collection.id}/edit`} className="hover:text-seal-foreground">
            {collection.title}
          </Link>
        </h2>
        {hidden && collection.moderationReason ? (
          <p className="mt-1 line-clamp-1 text-caption text-danger">
            隐藏原因：{collection.moderationReason}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={published ? "success" : "warning"}>
          {published ? "已发布" : "草稿"}
        </Badge>
        {hidden ? <Badge variant="danger">已隐藏</Badge> : null}
      </div>
      <p className="text-label text-subtle">
        {collection.visibility === "public" ? "公开" : "仅成员可见"}
      </p>
      <p className="text-label text-subtle">{collection.itemCount} 篇</p>
      <p className="text-label text-subtle">
        <span className="xl:hidden">更新于 </span>
        {formatPoemDate(collection.updatedAt)}
      </p>
      <div className="flex flex-wrap items-center gap-2 xl:justify-end">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/account/collections/${collection.id}/edit`}>
            {suspended ? "查看" : "编辑"}
          </Link>
        </Button>
        {!suspended ? (
          <CollectionActions
            id={collection.id}
            status={collection.status}
            publishedAt={collection.publishedAt}
            moderationStatus={collection.moderationStatus}
            availableItemCount={collection.availableItemCount}
            compact
          />
        ) : null}
      </div>
    </article>
  );
}
