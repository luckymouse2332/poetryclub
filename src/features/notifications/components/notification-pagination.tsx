import { PaginationNavigation } from "@/components/pagination-navigation";
import type { NotificationFilter } from "@/server/validation/notifications";

type NotificationPaginationProps = Readonly<{
  page: number;
  pageCount: number;
  filter: NotificationFilter;
}>;

function pageHref(page: number, filter: NotificationFilter): string {
  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  if (filter !== "all") query.set("filter", filter);
  const value = query.toString();
  return value ? `/notifications?${value}` : "/notifications";
}

export function NotificationPagination({
  page,
  pageCount,
  filter,
}: NotificationPaginationProps) {
  if (pageCount <= 1) return null;
  return (
    <PaginationNavigation
      page={page}
      pageCount={pageCount}
      previousHref={page > 1 ? pageHref(page - 1, filter) : null}
      nextHref={page < pageCount ? pageHref(page + 1, filter) : null}
      ariaLabel="通知分页"
      className="mt-8"
    />
  );
}
