"use client";

/** 不是上游组件：复用项目二级导航的边界、Token 和路由 active 语义。 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ViewTransition } from "react";

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
        className={cn("border-y border-border bg-transparent", className)}
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
                    "relative flex min-h-control items-center px-3 font-serif text-body text-subtle no-underline transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
                    active && "text-primary",
                  )}
                >
                  {item.label}
                  {active ? (
                    <ViewTransition
                      name="embedded-navigation-indicator"
                      share="navigation-marker"
                      default="none"
                    >
                      <span
                        aria-hidden="true"
                        data-slot="embedded-navigation-indicator"
                        className="absolute inset-x-3 bottom-0 h-0.5 bg-seal"
                      />
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

  return (
    <nav
      aria-label={ariaLabel}
      data-variant={variant}
      className={cn("border-y border-border-subtle bg-paper", className)}
    >
      <ul className="mx-auto flex w-full max-w-content flex-nowrap items-center gap-2 overflow-x-auto px-page py-2">
        {items.map((item) => {
          const active = matchesPath(pathname, item);
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-control items-center px-3 font-serif text-body text-subtle no-underline transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none",
                  active && "text-primary",
                )}
              >
                {item.label}
                {active ? (
                  <ViewTransition
                    name="secondary-navigation-indicator"
                    share="navigation-marker"
                    default="none"
                  >
                    <span
                      aria-hidden="true"
                      data-slot="secondary-navigation-indicator"
                      className="absolute inset-x-1 bottom-0 h-0.5 bg-seal"
                    />
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
