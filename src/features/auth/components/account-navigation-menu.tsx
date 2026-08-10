"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/features/auth/actions";
import { SiteNavLink } from "@/components/site-nav-link";

type AccountNavigationMenuProps = Readonly<{
  className: string;
}>;

const triggerClassName =
  "relative inline-flex min-h-control items-center justify-center whitespace-nowrap px-1 font-serif text-label tracking-[0.14em] text-foreground no-underline transition-colors hover:text-seal focus-visible:text-seal data-[active=true]:text-seal-foreground after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:bg-seal after:opacity-0 after:transition-opacity data-[active=true]:after:opacity-100";

const menuLinkClassName =
  "flex min-h-control items-center px-3 py-2 font-medium text-foreground";

export function AccountNavigationMenu({
  className,
}: AccountNavigationMenuProps) {
  const pathname = usePathname();
  const isActive = pathname === "/account" || pathname.startsWith("/account/");

  return (
    <>
      <SiteNavLink
        href="/account"
        match="prefix"
        className={`lg:hidden ${className}`}
      >
        我的
      </SiteNavLink>
      <div className="hidden lg:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`${triggerClassName} ${className}`}
              data-active={isActive}
              aria-label="我的"
            >
              我的
              <ChevronDown aria-hidden="true" className="ml-1 size-4" />
            </button>
          </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(16rem,calc(100vw-2rem))] p-2"
      >
        <DropdownMenuLabel className="px-3 py-1 text-caption font-normal text-subtle">
          我的
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/account/poems" className={menuLinkClassName}>
            我的诗作
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account" className={menuLinkClassName}>
            账户
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
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
              className="flex min-h-control w-full items-center px-3 py-2 font-medium text-foreground"
            >
              登出
            </button>
          </form>
        </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
