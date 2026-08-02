import Link from "next/link";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPoemDate } from "@/features/posts/formatters";
import { PoemActions } from "@/features/posts/components/poem-actions";
import type { OwnPoemSummary } from "@/server/services/poems";

type OwnPoemCardProps = Readonly<{
  poem: OwnPoemSummary;
}>;

const STATUS_LABEL = {
  draft: "草稿",
  published: "已发布",
} as const;

const STATUS_VARIANT = {
  draft: "warning",
  published: "success",
} as const;

/** 我的诗作列表卡片：状态、更新时间与首次发布时间，以及编辑入口和状态操作。 */
export function OwnPoemCard({ poem }: OwnPoemCardProps) {
  const publishedLabel = poem.publishedAt
    ? `首次发布 ${formatPoemDate(poem.publishedAt)}`
    : "尚未发布";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-body-lg font-semibold text-foreground">
            <Link
              href={`/account/poems/${poem.id}/edit`}
              className="rounded-sm no-underline transition-colors hover:text-primary"
            >
              {poem.title}
            </Link>
          </h2>
        </CardTitle>
        <CardDescription>
          <Badge variant={STATUS_VARIANT[poem.status]}>
            {STATUS_LABEL[poem.status]}
          </Badge>
          <span className="ml-1">
            更新于 {formatPoemDate(poem.updatedAt)} · {publishedLabel}
          </span>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-wrap items-center gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/account/poems/${poem.id}/edit`}>编辑</Link>
        </Button>
        <PoemActions id={poem.id} status={poem.status} compact />
      </CardFooter>
    </Card>
  );
}
