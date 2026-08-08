import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPoemDate } from "@/features/posts/formatters";
import type { PublicPoemSummary } from "@/server/services/poems";

type PoemCardProps = Readonly<{
  poem: PublicPoemSummary;
  /** 标题层级：独立列表页用 h2，嵌入首页区块时用 h3 保持标题层级正确。 */
  titleLevel?: "h2" | "h3";
}>;

/**
 * 公开诗作卡片：标题（链接）、作者与发布时间、短摘要与阅读入口。
 * 摘要是服务端截断的纯文本，用 `whitespace-pre-line` 保留必要换行，
 * 再用 `line-clamp` 控制高度避免卡片过高。
 */
export function PoemCard({ poem, titleLevel = "h2" }: PoemCardProps) {
  const Title = titleLevel;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Title className="text-body-lg font-semibold text-foreground">
            <Link
              href={`/poems/${poem.id}`}
              className="rounded-sm no-underline transition-colors hover:text-primary"
            >
              {poem.title}
            </Link>
          </Title>
        </CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-1.5">
          <span>作者：{poem.authorName}</span>
          <span aria-hidden="true"> · </span>
          <span>发布于 {formatPoemDate(poem.publishedAt)}</span>
          {poem.visibility === "members_only" ? (
            <Badge variant="neutral">仅成员可见</Badge>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-4 whitespace-pre-line text-body text-subtle">
          {poem.excerpt}
        </p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/poems/${poem.id}`}>阅读全文</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
