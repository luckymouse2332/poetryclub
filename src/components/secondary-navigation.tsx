"use client";

/** 不是上游组件：复用项目二级导航的边界、Token 和路由 active 语义。 */

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  variant?: "bar" | "embedded";
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
  variant = "bar",
}: SecondaryNavigationProps) {
  const pathname = usePathname();

  if (variant === "embedded") {
    return (
      <nav
        aria-label={ariaLabel}
        data-variant={variant}
        className={cn(
          "border-y border-border-subtle bg-transparent",
          className,
        )}
      >
        <ul className="flex w-full flex-nowrap items-center overflow-x-auto py-1">
          {items.map((item) => {
            const active = matchesPath(pathname, item);
            return (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-11 items-center px-3 text-label font-medium text-subtle no-underline transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-inset",
                    active &&
                      "text-seal-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-seal",
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

  return (
    <nav
      aria-label={ariaLabel}
      data-variant={variant}
      className={cn(
        "border-y border-border-subtle bg-paper",
        className,
      )}
    >
      <ul className="mx-auto flex w-full max-w-content flex-nowrap items-center gap-5 overflow-x-auto px-page py-1.5 sm:gap-7">
        {items.map((item) => {
          const active = matchesPath(pathname, item);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-10 items-center px-1 font-serif text-[1rem] tracking-[0.04em] text-subtle no-underline transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                  active && "text-seal-foreground",
                )}
              >
                {item.label}
                {active ? (
                  <span
                    aria-hidden="true"
                    data-slot="secondary-navigation-indicator"
                    className="absolute inset-x-1 bottom-0 h-0.5 bg-seal"
                    style={{ viewTransitionName: "secondary-navigation-indicator" }}
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
