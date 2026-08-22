import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { formatPoemDate } from "@/features/posts/formatters";
import type { PublicPoemSummary } from "@/server/services/poems";

type PoemCardProps = Readonly<{ poem: PublicPoemSummary; titleLevel?: "h2" | "h3" }>;

/** 公开诗作档案索引行：保留组件接口，视觉由卡片改为编辑式行。 */
export function PoemCard({ poem, titleLevel = "h2" }: PoemCardProps) {
  const Title = titleLevel;
  return (
    <article className="group grid gap-3 border-b border-border-subtle py-6 first:border-t md:grid-cols-[8rem_minmax(0,1fr)_11rem] md:gap-6">
      <time dateTime={poem.publishedAt.toISOString()} className="text-label tabular-nums text-subtle">
        {formatPoemDate(poem.publishedAt)}
      </time>
      <div className="min-w-0">
        <Title className="font-serif text-section-title font-normal text-foreground">
          <Link href={`/poems/${poem.id}`} className="transition-colors group-hover:text-seal-foreground focus-visible:text-seal-foreground">
            《{poem.title}》
          </Link>
        </Title>
        <p className="mt-2 line-clamp-2 whitespace-pre-line font-serif text-body leading-copy text-subtle">{poem.excerpt}</p>
      </div>
      <div className="flex flex-wrap items-start gap-2 md:justify-end md:text-right">
        <span className="text-label text-subtle">{poem.authorName}</span>
        {typeof poem.commentCount === "number" ? (
          <span className="text-label text-subtle">{poem.commentCount} 条评论</span>
        ) : null}
        {poem.visibility === "members_only" ? <Badge variant="neutral">成员可见</Badge> : null}
      </div>
    </article>
  );
}
