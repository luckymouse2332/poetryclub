import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPoemDate } from "@/features/posts/formatters";
import type { PublishedCollectionSummary } from "@/server/services/collections";

export function CollectionCard({
  collection,
}: Readonly<{ collection: PublishedCollectionSummary }>) {
  return (
    <article className="group grid gap-3 border-b border-border-subtle py-6 first:border-t md:grid-cols-[8rem_minmax(0,1fr)_11rem] md:gap-6">
      <time
        dateTime={collection.publishedAt.toISOString()}
        className="text-label tabular-nums text-subtle"
      >
        {formatPoemDate(collection.publishedAt)}
      </time>
      <div className="min-w-0">
        <h2 className="font-serif text-section-title font-normal text-foreground">
          <Link
            href={`/collections/${collection.id}`}
            className="transition-colors group-hover:text-seal-foreground focus-visible:text-seal-foreground"
          >
            {collection.title}
          </Link>
        </h2>
        {collection.description ? (
          <p className="mt-2 line-clamp-2 whitespace-pre-line text-body leading-copy text-subtle">
            {collection.description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-start gap-2 md:justify-end md:text-right">
        <span className="text-label text-subtle">整理：{collection.ownerName}</span>
        <span className="text-label text-subtle">{collection.itemCount} 篇</span>
        {collection.visibility === "members_only" ? (
          <Badge variant="neutral">成员可见</Badge>
        ) : null}
      </div>
    </article>
  );
}
