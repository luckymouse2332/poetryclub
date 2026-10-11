import { CatalogRow } from "@/components/catalog-row";

import { Badge } from "@/components/ui/badge";
import { formatPoemDate } from "@/features/posts/formatters";
import type { PublicPoemSummary } from "@/server/services/poems";

type PoemCardProps = Readonly<{
  poem: PublicPoemSummary;
  titleLevel?: "h2" | "h3";
}>;

/** 不是上游组件：公开诗作目录行，保留作者、日期、摘要与访问范围。 */
export function PoemCard({ poem, titleLevel = "h2" }: PoemCardProps) {
  return (
    <CatalogRow
      date={
        <time
          dateTime={poem.publishedAt.toISOString()}
          className="text-label text-subtle tabular-nums"
        >
          {formatPoemDate(poem.publishedAt)}
        </time>
      }
      href={`/poems/${poem.id}`}
      title={<>《{poem.title}》</>}
      titleLevel={titleLevel}
      description={
        <p className="line-clamp-3 font-serif text-body leading-reading whitespace-pre-line text-subtle">
          {poem.excerpt}
        </p>
      }
      metadata={
        <>
          <span className="text-label text-subtle">{poem.authorName}</span>
          {typeof poem.commentCount === "number" ? (
            <span className="text-label text-subtle">
              {poem.commentCount} 条评论
            </span>
          ) : null}
          {poem.visibility === "members_only" ? (
            <Badge variant="neutral">成员可见</Badge>
          ) : null}
        </>
      }
    />
  );
}
