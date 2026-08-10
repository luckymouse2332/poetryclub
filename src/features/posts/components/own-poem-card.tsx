import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PoemActions } from "@/features/posts/components/poem-actions";
import { formatPoemDate } from "@/features/posts/formatters";
import type { OwnPoemSummary } from "@/server/services/poems";

type OwnPoemCardProps = Readonly<{ poem: OwnPoemSummary; suspended?: boolean }>;

const STATUS_LABEL = { draft: "草稿", published: "已发布" } as const;
const STATUS_VARIANT = { draft: "warning", published: "success" } as const;

/** 我的诗作响应式管理行：桌面横向扫描，移动端自然堆叠。 */
export function OwnPoemCard({ poem, suspended = false }: OwnPoemCardProps) {
  const hidden = poem.moderationStatus === "hidden";

  return (
    <article className="grid gap-4 border-b border-border-subtle py-5 first:border-t lg:grid-cols-[minmax(12rem,1.5fr)_8rem_9rem_11rem_minmax(13rem,auto)] lg:items-center lg:gap-5">
      <div className="min-w-0">
        <h2 className="truncate font-serif text-body-lg text-foreground">
          <Link href={`/account/poems/${poem.id}/edit`} className="hover:text-seal-foreground">
            {poem.title}
          </Link>
        </h2>
        {hidden && poem.moderationReason ? (
          <p className="mt-1 line-clamp-1 text-caption text-danger">隐藏原因：{poem.moderationReason}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={STATUS_VARIANT[poem.status]}>{STATUS_LABEL[poem.status]}</Badge>
        {hidden ? <Badge variant="danger">已隐藏</Badge> : null}
      </div>
      <p className="text-label text-subtle">{poem.visibility === "public" ? "公开" : "仅成员可见"}</p>
      <p className="text-label text-subtle"><span className="lg:hidden">更新于 </span>{formatPoemDate(poem.updatedAt)}</p>
      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/account/poems/${poem.id}/edit`}>{suspended ? "查看" : "编辑"}</Link>
        </Button>
        {!suspended ? <PoemActions id={poem.id} status={poem.status} moderationStatus={poem.moderationStatus} compact /> : null}
      </div>
    </article>
  );
}
