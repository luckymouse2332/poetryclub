import Link from "next/link";

import { Button } from "@/components/ui/button";

type AdminPaginationProps = Readonly<{
  basePath: string;
  page: number;
  pageCount: number;
  /** 需要保留到下一页 / 上一页链接中的筛选条件。 */
  query: Readonly<Record<string, string | undefined>>;
}>;

function pageHref(
  basePath: string,
  page: number,
  query: Readonly<Record<string, string | undefined>>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  }
  // 第 1 页保持干净 URL（保留筛选、去掉 page），与项目分页惯例一致。
  if (page > 1) {
    params.set("page", String(page));
  }
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * 管理列表分页（Server Component，业务组件，非通用 UI）。
 * 与 posts/pagination 的区别：可保留当前筛选 query，避免翻页丢失条件。
 * 每页数量由服务端 service 固定为 20，此处只渲染方向链接。
 */
export function AdminPagination({
  basePath,
  page,
  pageCount,
  query,
}: AdminPaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="分页"
      className="mt-8 flex items-center justify-between gap-4 border-t border-border-subtle pt-6"
    >
      {page > 1 ? (
        <Button asChild variant="secondary">
          <Link href={pageHref(basePath, page - 1, query)}>上一页</Link>
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
      <p className="text-label text-subtle" aria-current="page">
        第 {page} / {pageCount} 页
      </p>
      {page < pageCount ? (
        <Button asChild variant="secondary">
          <Link href={pageHref(basePath, page + 1, query)}>下一页</Link>
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
