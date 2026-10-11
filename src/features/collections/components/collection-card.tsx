import { CatalogRow } from "@/components/catalog-row";

import { Badge } from "@/components/ui/badge";
import { formatPoemDate } from "@/features/posts/formatters";
import type { PublishedCollectionSummary } from "@/server/services/collections";

/** 不是上游组件：特辑目录行，保留摘要、整理者、篇数与访问范围。 */
export function CollectionCard({
  collection,
}: Readonly<{
  collection: PublishedCollectionSummary;
}>) {
  return (
    <CatalogRow
      date={
        <time
          dateTime={collection.publishedAt.toISOString()}
          className="text-label text-subtle tabular-nums"
        >
          {formatPoemDate(collection.publishedAt)}
        </time>
      }
      href={`/collections/${collection.id}`}
      title={<>{collection.title}</>}
      description={
        collection.description ? (
          <p className="line-clamp-2 text-body leading-copy whitespace-pre-line text-subtle">
            {collection.description}
          </p>
        ) : null
      }
      metadata={
        <>
          <span className="text-label text-subtle">
            整理：{collection.ownerName}
          </span>
          <span className="text-label text-subtle">
            {collection.itemCount} 篇
          </span>
          {collection.visibility === "members_only" ? (
            <Badge variant="neutral">成员可见</Badge>
          ) : null}
        </>
      }
    />
  );
}
