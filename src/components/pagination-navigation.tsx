import Link from "next/link";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

type PaginationNavigationProps = Readonly<{
  page: number;
  pageCount: number;
  previousHref: string | null;
  nextHref: string | null;
  ariaLabel: string;
  className?: string;
}>;

/** 不是上游组件：把项目的方向分页规则组合到 shadcn/ui Pagination。 */
export function PaginationNavigation({
  page,
  pageCount,
  previousHref,
  nextHref,
  ariaLabel,
  className,
}: PaginationNavigationProps) {
  if (pageCount <= 1) return null;

  return (
    <Pagination
      aria-label={ariaLabel}
      className={cn("border-t border-border-subtle pt-6", className)}
    >
      <PaginationContent className="w-full justify-between gap-4">
        <PaginationItem>
          {previousHref ? (
            <PaginationPrevious asChild>
              <Link href={previousHref}>上一页</Link>
            </PaginationPrevious>
          ) : (
            <PaginationPrevious aria-disabled="true" tabIndex={-1} className="invisible" />
          )}
        </PaginationItem>
        <PaginationItem>
          <span className="text-label text-subtle" aria-current="page">
            第 {page} / {pageCount} 页
          </span>
        </PaginationItem>
        <PaginationItem>
          {nextHref ? (
            <PaginationNext asChild>
              <Link href={nextHref}>下一页</Link>
            </PaginationNext>
          ) : (
            <PaginationNext aria-disabled="true" tabIndex={-1} className="invisible" />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
