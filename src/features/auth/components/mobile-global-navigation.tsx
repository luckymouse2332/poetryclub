"use client";

/** 不是上游组件：移动端全站导航状态，交互与焦点管理复用 shadcn/ui Dialog。 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type MobileGlobalNavigationProps = Readonly<{
  isActiveAdmin: boolean;
}>;

const MOBILE_MENU_ID = "mobile-site-navigation";

export function MobileGlobalNavigation({
  isActiveAdmin,
}: MobileGlobalNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, []);

  const items = [
    { href: "/poems", label: "诗作", match: "prefix" as const },
    { href: "/about", label: "关于", match: "exact" as const },
    ...(isActiveAdmin
      ? [{ href: "/admin", label: "管理", match: "prefix" as const }]
      : []),
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="打开全站导航"
          aria-controls={MOBILE_MENU_ID}
          aria-expanded={open}
          className="flex size-12 items-center justify-center text-foreground transition-colors hover:text-seal-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Menu aria-hidden="true" className="size-6" strokeWidth={1.75} />
        </button>
      </DialogTrigger>
      <DialogContent
        id={MOBILE_MENU_ID}
        showCloseButton={false}
        overlayClassName="mobile-navigation-overlay top-16 bg-foreground/10 backdrop-blur-[4px] lg:hidden"
        className="mobile-navigation-shell pointer-events-none inset-0 block h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-0 bg-transparent p-0 shadow-none lg:hidden"
      >
        <DialogTitle className="sr-only">全站导航</DialogTitle>
        <DialogDescription className="sr-only">
          前往诗作、关于和管理页面。
        </DialogDescription>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="关闭全站导航"
            className="pointer-events-auto absolute top-2 left-3 z-10 flex size-12 items-center justify-center bg-background text-foreground transition-colors hover:text-seal-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <X
              aria-hidden="true"
              className="mobile-navigation-close-icon size-6"
              strokeWidth={1.75}
            />
          </button>
        </DialogClose>

        <div className="mobile-navigation-drawer pointer-events-auto absolute top-16 bottom-0 left-0 flex w-[min(21rem,calc(100vw-2rem))] flex-col overflow-hidden border-r border-border-strong bg-background/94 shadow-floating backdrop-blur-lg">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-8">
            <nav aria-label="全站导航">
              <ul>
                {items.map((item) => {
                  const active =
                    item.match === "prefix"
                      ? pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                      : pathname === item.href;
                  return (
                    <li
                      key={item.href}
                      className="border-b border-border-subtle"
                    >
                      <DialogClose asChild>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex min-h-20 items-center justify-between py-4 font-serif text-[1.35rem] tracking-[0.08em] text-foreground no-underline transition-colors hover:text-seal-foreground focus-visible:outline-none focus-visible:text-seal-foreground",
                            active && "text-seal-foreground",
                          )}
                        >
                          <span>{item.label}</span>
                        </Link>
                      </DialogClose>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="mt-auto border-t border-border-subtle pt-6">
              <p className="font-serif text-body text-foreground">回中诗社</p>
              <p className="mt-1 text-caption tracking-[0.08em] text-subtle">
                2021—2024级
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
