import { PaginationNavigation } from "@/components/pagination-navigation";

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
    <PaginationNavigation
      page={page}
      pageCount={pageCount}
      previousHref={page > 1 ? previousHref : null}
      nextHref={page < pageCount ? `${basePath}?page=${page + 1}` : null}
      ariaLabel="分页"
    />
  );
}
