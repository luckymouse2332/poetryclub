import { ManagementRow } from "@/components/layout/management-row";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PoemListActions } from "@/features/posts/components/poem-list-actions";
import { formatPoemDate } from "@/features/posts/formatters";
import type { OwnPoemSummary } from "@/server/services/poems";

type OwnPoemCardProps = Readonly<{ poem: OwnPoemSummary; suspended?: boolean }>;

const STATUS_LABEL = { draft: "草稿", published: "已发布" } as const;
const STATUS_VARIANT = { draft: "warning", published: "success" } as const;

/** 我的诗作响应式管理行：桌面横向扫描，移动端自然堆叠。 */
export function OwnPoemCard({ poem, suspended = false }: OwnPoemCardProps) {
  const hidden = poem.moderationStatus === "hidden";

  return (
    <ManagementRow
      actions={
        <>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/account/poems/${poem.id}/edit`}>
              {suspended ? "查看" : "编辑"}
            </Link>
          </Button>
          {!suspended ? (
            <PoemListActions
              id={poem.id}
              status={poem.status}
              publishedAt={poem.publishedAt}
              moderationStatus={poem.moderationStatus}
              title={poem.title}
            />
          ) : null}
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h2 className="min-w-0 font-serif text-body-lg font-medium break-words text-foreground">
          <Link
            href={`/account/poems/${poem.id}/edit`}
            className="hover:text-primary"
          >
            {poem.title}
          </Link>
        </h2>
        <Badge variant={STATUS_VARIANT[poem.status]}>
          {STATUS_LABEL[poem.status]}
        </Badge>
        {hidden ? <Badge variant="danger">已隐藏</Badge> : null}
      </div>
      <p className="mt-1.5 flex flex-wrap gap-x-2 text-label text-subtle">
        <span>{poem.visibility === "public" ? "公开" : "仅成员可见"}</span>
        <span aria-hidden="true">·</span>
        <span>更新于 {formatPoemDate(poem.updatedAt)}</span>
      </p>
      {hidden && poem.moderationReason ? (
        <p className="mt-2 text-label break-words text-danger">
          隐藏原因：{poem.moderationReason}
        </p>
      ) : null}
    </ManagementRow>
  );
}
