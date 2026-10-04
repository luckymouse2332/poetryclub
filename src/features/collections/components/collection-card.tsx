import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPoemDate } from "@/features/posts/formatters";
import type { PublishedCollectionSummary } from "@/server/services/collections";

/** 不是上游组件：特辑目录行，保留摘要、整理者、篇数与访问范围。 */
export function CollectionCard({ collection }: Readonly<{
  collection: PublishedCollectionSummary;
}>) {
  return (
    <article className="grid min-w-0 gap-4 bg-transparent py-6 sm:py-8 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-8">
          <time dateTime={collection.publishedAt.toISOString()} className="text-label tabular-nums text-subtle">
            {formatPoemDate(collection.publishedAt)}
          </time>
          <h2 className="min-w-0 font-serif text-section-title font-normal text-foreground">
            <Link href={`/collections/${collection.id}`} className="block min-h-control content-center wrap-anywhere underline decoration-1 decoration-transparent underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:text-primary focus-visible:decoration-primary">
              {collection.title}
            </Link>
          </h2>
        {collection.description ? (
          <div className="min-w-0 sm:col-start-2">
            <p className="line-clamp-2 whitespace-pre-line text-body leading-copy text-subtle">
              {collection.description}
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-start-2">
          <span className="text-label text-subtle">整理：{collection.ownerName}</span>
          <span className="text-label text-subtle">{collection.itemCount} 篇</span>
          {collection.visibility === "members_only" ? (<Badge variant="neutral">成员可见</Badge>) : null}
        </div>
    </article>
  );
}
