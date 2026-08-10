"use client";

/** 不是上游组件：项目工作区的桌面常驻导航与移动二级导航。 */

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type WorkspaceNavigationItem = Readonly<{
  href: string;
  label: string;
  match?: "exact" | "prefix";
}>;

type WorkspaceNavigationProps = Readonly<{
  ariaLabel: string;
  items: ReadonlyArray<WorkspaceNavigationItem>;
}>;

function matchesPath(pathname: string, item: WorkspaceNavigationItem) {
  return item.match === "prefix"
    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
    : pathname === item.href;
}

export function WorkspaceNavigation({
  ariaLabel,
  items,
}: WorkspaceNavigationProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel}>
      <ul className="space-y-1">
        {items.map((item) => {
          const active = matchesPath(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center border-l-2 border-transparent px-4 text-label font-medium text-subtle transition-colors hover:border-border-strong hover:text-foreground",
                  active && "border-seal bg-seal-surface text-seal-foreground",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
