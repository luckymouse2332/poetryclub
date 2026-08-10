import Link from "next/link";

import { Button } from "@/components/ui/button";
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
    <nav
      aria-label="通知分页"
      className="mt-8 flex items-center justify-between gap-4 border-t border-border-subtle pt-6"
    >
      {page > 1 ? (
        <Button asChild variant="secondary">
          <Link href={pageHref(page - 1, filter)}>上一页</Link>
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
      <p className="text-label text-subtle" aria-current="page">
        第 {page} / {pageCount} 页
      </p>
      {page < pageCount ? (
        <Button asChild variant="secondary">
          <Link href={pageHref(page + 1, filter)}>下一页</Link>
        </Button>
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
}
