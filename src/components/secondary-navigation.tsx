"use client";

/** 不是上游组件：复用项目二级导航的边界、Token 和路由 active 语义。 */

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SecondaryNavigationItem = Readonly<{
  href: string;
  label: string;
  match?: "exact" | "prefix";
}>;

type SecondaryNavigationProps = Readonly<{
  ariaLabel: string;
  items: ReadonlyArray<SecondaryNavigationItem>;
  className?: string;
}>;

function matchesPath(pathname: string, item: SecondaryNavigationItem): boolean {
  return item.match === "prefix"
    ? pathname === item.href || pathname.startsWith(`${item.href}/`)
    : pathname === item.href;
}

export function SecondaryNavigation({
  ariaLabel,
  items,
  className,
}: SecondaryNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={ariaLabel}
      className={cn("border-b border-border-subtle bg-surface", className)}
    >
      <ul className="mx-auto flex w-full max-w-content flex-wrap items-center gap-1 px-page py-2">
        {items.map((item) => {
          const active = matchesPath(pathname, item);
          return (
            <li key={item.href}>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={active ? "bg-accent text-accent-foreground" : undefined}
              >
                <Link href={item.href} aria-current={active ? "page" : undefined}>
                  {item.label}
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
