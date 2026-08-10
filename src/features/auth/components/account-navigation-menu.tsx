"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  FilePenLine,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

type AccountNavigationMenuProps = Readonly<{
  variant: "desktop" | "mobile";
  className?: string;
  displayName?: string;
  initial?: string;
  unreadCount?: number;
}>;

const desktopTriggerClassName =
  "group relative inline-flex min-h-control items-center justify-center whitespace-nowrap px-1 font-serif text-label tracking-[0.14em] text-foreground no-underline transition-colors hover:text-seal focus-visible:text-seal data-[active=true]:text-seal-foreground data-[state=open]:text-seal-foreground after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:bg-seal after:opacity-0 after:transition-opacity data-[active=true]:after:opacity-100 data-[state=open]:after:opacity-100";

const menuLinkClassName = "w-full";

export function AccountNavigationMenu({
  variant,
  className,
  displayName = "当前用户",
  initial = "",
  unreadCount = 0,
}: AccountNavigationMenuProps) {
  const pathname = usePathname();
  const isActive = pathname === "/account" || pathname.startsWith("/account/");
  const mobile = variant === "mobile";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {mobile ? (
          <button
            type="button"
            data-active={isActive}
            aria-label={`${displayName}的账户菜单，${unreadCount} 条未读通知`}
            className="group relative flex size-12 items-center justify-center text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seal focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-full border border-border-strong bg-paper font-serif text-label leading-none text-foreground transition-colors group-data-[state=open]:border-seal group-data-[state=open]:text-seal-foreground"
            >
              {initial}
            </span>
            {unreadCount > 0 ? (
              <span
                aria-hidden="true"
                data-unread-indicator="true"
                className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-seal"
              />
            ) : null}
          </button>
        ) : (
          <button
            type="button"
            className={cn(desktopTriggerClassName, className)}
            data-active={isActive}
            aria-label="我的"
          >
            我的
            <ChevronDown
              aria-hidden="true"
              className="ml-1 size-4 transition-transform duration-160 group-data-[state=open]:rotate-180"
            />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="px-3 py-2">
          <span className="block font-serif text-body text-foreground">
            我的工作区
          </span>
          <span className="mt-0.5 block text-caption font-normal text-subtle">
            管理账户与个人诗作
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account/poems" className={menuLinkClassName}>
              <FilePenLine aria-hidden="true" />
              <span>我的诗作</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account" className={menuLinkClassName}>
              <UserRound aria-hidden="true" />
              <span>账户信息</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/security" className={menuLinkClassName}>
              <ShieldCheck aria-hidden="true" />
              <span>账户安全</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild variant="destructive">
          <form action={logoutAction} className="w-full">
            <button
              type="submit"
              onClick={async (event) => {
                event.preventDefault();
                const response = await fetch("/api/auth/sign-out", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: "{}",
                });
                if (response.ok) window.location.assign("/");
              }}
              className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left"
            >
              <LogOut aria-hidden="true" className="size-4" />
              登出
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
