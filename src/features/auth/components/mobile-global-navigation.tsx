"use client";

/** 不是上游组件：移动端全站导航状态，浮层与焦点复用 shadcn/ui Sheet。 */

import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { Collapsible as CollapsiblePrimitive } from "radix-ui";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ADMIN_NAV_ITEMS } from "@/features/moderation/components/admin-nav";
import { cn } from "@/lib/utils";

import styles from "./mobile-global-navigation.module.css";

type MobileGlobalNavigationProps = Readonly<{
  isActiveAdmin: boolean;
}>;

const MOBILE_MENU_ID = "mobile-site-navigation";

export function MobileGlobalNavigation({
  isActiveAdmin,
}: MobileGlobalNavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [adminNavigationOpen, setAdminNavigationOpen] = useState(
    pathname === "/admin" || pathname.startsWith("/admin/"),
  );

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
  ];

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setAdminNavigationOpen(
        pathname === "/admin" || pathname.startsWith("/admin/"),
      );
    }
  };

  const focusNavigationBoundary = (last: boolean) => {
    const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const target = focusable?.[last ? focusable.length - 1 : 0];
    target?.focus();
  };

  const handleContentKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return;
    const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const boundary = event.shiftKey ? focusable[0] : focusable[focusable.length - 1];
    if (document.activeElement === boundary) {
      event.preventDefault();
      triggerRef.current?.focus();
    }
  };

  return (
    <Sheet modal={false} open={open} onOpenChange={handleOpenChange}>
      {/*
        刊头保持不透明并位于遮罩之上，汉堡按钮在打开后就地切换为叉：
        Sheet 打开时取消默认自动聚焦，触发器因此同时是可见的关闭入口。
      */}
      <SheetTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label={open ? "关闭全站导航" : "打开全站导航"}
          aria-controls={MOBILE_MENU_ID}
          aria-expanded={open}
          onKeyDown={(event) => {
            if (open && event.key === "Tab") {
              event.preventDefault();
              focusNavigationBoundary(event.shiftKey);
            }
          }}
          className="pointer-events-auto flex size-12 items-center justify-center text-foreground transition-colors hover:text-seal-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {open ? (
            <X
              aria-hidden="true"
              className={cn(styles.closeIcon, "size-6")}
              strokeWidth={1.75}
            />
          ) : (
            <Menu aria-hidden="true" className="size-6" strokeWidth={1.75} />
          )}
        </button>
      </SheetTrigger>
      <SheetContent
        ref={contentRef}
        id={MOBILE_MENU_ID}
        side="left"
        showCloseButton={false}
        interactiveOverlay
        overlayState={open ? "open" : "closed"}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
        onKeyDown={handleContentKeyDown}
        overlayClassName={cn(
          styles.overlay,
          "bg-foreground/10 backdrop-blur-[4px] lg:hidden",
        )}
        className={cn(
          styles.content,
          "overflow-hidden bg-background/94 shadow-floating backdrop-blur-lg lg:hidden",
        )}
      >
        <SheetTitle className="sr-only">全站导航</SheetTitle>
        <SheetDescription className="sr-only">
          前往诗作、关于和管理后台页面。
        </SheetDescription>

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
                    <SheetClose asChild>
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
                    </SheetClose>
                  </li>
                );
              })}
              {isActiveAdmin ? (
                <li className="border-b border-border-subtle">
                  <CollapsiblePrimitive.Root
                    open={adminNavigationOpen}
                    onOpenChange={setAdminNavigationOpen}
                  >
                    <CollapsiblePrimitive.Trigger className="group flex min-h-20 w-full items-center justify-between py-4 font-serif text-[1.35rem] tracking-[0.08em] text-foreground transition-colors hover:text-seal-foreground focus-visible:outline-none focus-visible:text-seal-foreground">
                      <span>管理后台</span>
                      <ChevronDown
                        aria-hidden="true"
                        className="size-5 text-subtle transition-transform duration-200 group-data-[state=open]:rotate-180"
                        strokeWidth={1.5}
                      />
                    </CollapsiblePrimitive.Trigger>
                    <CollapsiblePrimitive.Content
                      className={cn(styles.adminCollapsible, "overflow-hidden")}
                    >
                      <ul className="mb-5 border-l border-border-strong pl-3">
                        {ADMIN_NAV_ITEMS.map((item) => {
                          const active =
                            item.match === "prefix"
                              ? pathname === item.href ||
                                pathname.startsWith(`${item.href}/`)
                              : pathname === item.href;
                          return (
                            <li key={item.href}>
                              <SheetClose asChild>
                                <Link
                                  href={item.href}
                                  aria-label={`管理：${item.label}`}
                                  aria-current={active ? "page" : undefined}
                                  className={cn(
                                    "relative flex min-h-11 items-center px-3 text-label font-medium text-subtle no-underline transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-seal-foreground",
                                    active &&
                                      "text-seal-foreground before:absolute before:top-1/2 before:-left-[0.8125rem] before:h-6 before:w-px before:-translate-y-1/2 before:bg-seal",
                                  )}
                                >
                                  {item.label}
                                </Link>
                              </SheetClose>
                            </li>
                          );
                        })}
                      </ul>
                    </CollapsiblePrimitive.Content>
                  </CollapsiblePrimitive.Root>
                </li>
              ) : null}
            </ul>
          </nav>
          <div className="mt-auto border-t border-border-subtle pt-6">
            <p className="font-serif text-body text-foreground">回中诗社</p>
            <p className="mt-1 text-caption tracking-[0.08em] text-subtle">
              2021—2024级
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
