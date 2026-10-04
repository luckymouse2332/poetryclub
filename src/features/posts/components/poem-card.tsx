import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPoemDate } from "@/features/posts/formatters";
import type { PublicPoemSummary } from "@/server/services/poems";

type PoemCardProps = Readonly<{
  poem: PublicPoemSummary;
  titleLevel?: "h2" | "h3";
}>;

/** 不是上游组件：公开诗作目录行，保留作者、日期、摘要与访问范围。 */
export function PoemCard({ poem, titleLevel = "h2" }: PoemCardProps) {
  const Title = titleLevel;
  return (
    <article className="grid min-w-0 gap-4 bg-transparent py-6 sm:py-8 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-8">
          <time dateTime={poem.publishedAt.toISOString()} className="text-label tabular-nums text-subtle">
            {formatPoemDate(poem.publishedAt)}
          </time>
          <Title className="min-w-0 font-serif text-section-title font-normal text-foreground">
            <Link href={`/poems/${poem.id}`} className="block min-h-control content-center wrap-anywhere underline decoration-1 decoration-transparent underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:text-primary focus-visible:decoration-primary">
              《{poem.title}》
            </Link>
          </Title>
        <div className="min-w-0 sm:col-start-2">
          <p className="line-clamp-3 whitespace-pre-line font-serif text-body leading-reading text-subtle">{poem.excerpt}</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:col-start-2">
          <span className="text-label text-subtle">{poem.authorName}</span>
          {typeof poem.commentCount === "number" ? (<span className="text-label text-subtle">{poem.commentCount} 条评论</span>) : null}
          {poem.visibility === "members_only" ? <Badge variant="neutral">成员可见</Badge> : null}
        </div>
    </article>
  );
}
