"use client";

/** 不是上游组件：项目工作区的大屏常驻侧边导航。 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

import type { SecondaryNavigationItem } from "@/components/secondary-navigation";
import { cn } from "@/lib/utils";

type WorkspaceNavigationProps = Readonly<{
  ariaLabel: string;
  items: ReadonlyArray<SecondaryNavigationItem>;
}>;

function matchesPath(pathname: string, item: SecondaryNavigationItem) {
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
    <nav aria-label={ariaLabel} data-variant="sidebar">
      <ul className="space-y-1">
        {items.map((item) => {
          const active = matchesPath(pathname, item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-11 items-center border-l-2 border-transparent px-4 font-serif text-body text-subtle no-underline transition-colors hover:bg-paper hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  active && "bg-paper text-foreground",
                )}
              >
                {item.label}
                {active ? (
                  <ViewTransition name="workspace-navigation-indicator" share="navigation-marker" default="none">
                    <span aria-hidden="true" data-slot="workspace-navigation-indicator" className="absolute -left-0.5 inset-y-0 w-0.5 bg-seal" />
                  </ViewTransition>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
