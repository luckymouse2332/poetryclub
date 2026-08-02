import Link from "next/link";

import { Button } from "@/components/ui/button";

type PaginationProps = Readonly<{
  /** 列表根路径（如 /poems），第 1 页链接保持干净 URL，其余带 ?page=N。 */
  basePath: string;
  page: number;
  pageCount: number;
}>;

/**
 * 上一页 / 下一页分页。只渲染两个方向链接与当前页码，
 * 不生成庞大页码列表；单页时不渲染。
 */
export function Pagination({ basePath, page, pageCount }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const previousHref =
    page - 1 <= 1 ? basePath : `${basePath}?page=${page - 1}`;

  return (
    <nav
      aria-label="分页"
      className="flex items-center justify-between gap-4 border-t border-border-subtle pt-6"
    >
      {page > 1 ? (
        <Button asChild variant="secondary">
          <Link href={previousHref}>上一页</Link>
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
      <p className="text-label text-subtle" aria-current="page">
        第 {page} / {pageCount} 页
      </p>
      {page < pageCount ? (
        <Button asChild variant="secondary">
          <Link href={`${basePath}?page=${page + 1}`}>下一页</Link>
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
