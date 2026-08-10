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
  authenticated: boolean;
  isActiveAdmin: boolean;
  unreadCount: number;
}>;

const MOBILE_MENU_ID = "mobile-site-navigation";

export function MobileGlobalNavigation({
  authenticated,
  isActiveAdmin,
  unreadCount,
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
    ...(authenticated
      ? [
          {
            href: "/notifications",
            label: "通知",
            match: "prefix" as const,
            unread: unreadCount > 0,
          },
        ]
      : []),
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
        overlayClassName="bg-background lg:hidden"
        className="inset-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-background p-0 shadow-none lg:hidden"
      >
        <DialogTitle className="sr-only">全站导航</DialogTitle>
        <DialogDescription className="sr-only">
          前往诗作、关于、通知和管理页面。
        </DialogDescription>
        <div className="grid h-16 shrink-0 grid-cols-[3rem_minmax(0,1fr)_3rem] items-center border-b border-border-subtle px-3">
          <DialogClose asChild>
            <button
              type="button"
              aria-label="关闭全站导航"
              className="flex size-12 items-center justify-center text-foreground transition-colors hover:text-seal-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <X aria-hidden="true" className="size-6" strokeWidth={1.75} />
            </button>
          </DialogClose>
          <DialogClose asChild>
            <Link
              href="/#top"
              className="min-w-0 justify-self-center whitespace-nowrap font-serif text-[1.25rem] tracking-[0.16em] text-foreground no-underline"
            >
              回中诗社
            </Link>
          </DialogClose>
          <span aria-hidden="true" className="size-12" />
        </div>

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
                  <li key={item.href} className="border-b border-border-subtle">
                    <DialogClose asChild>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        aria-label={
                          "unread" in item && item.unread
                            ? `${item.label}，有未读通知`
                            : item.label
                        }
                        className={cn(
                          "flex min-h-20 items-center justify-between py-4 font-serif text-[1.35rem] tracking-[0.08em] text-foreground no-underline transition-colors hover:text-seal-foreground focus-visible:outline-none focus-visible:text-seal-foreground",
                          active && "text-seal-foreground",
                        )}
                      >
                        <span>{item.label}</span>
                        {"unread" in item && item.unread ? (
                          <span
                            aria-hidden="true"
                            data-unread-indicator="true"
                            className="size-1.5 rounded-full bg-seal"
                          />
                        ) : null}
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
      </DialogContent>
    </Dialog>
  );
}
