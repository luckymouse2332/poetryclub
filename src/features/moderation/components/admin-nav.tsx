import Link from "next/link";

import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/admin", label: "总览" },
  { href: "/admin/poems", label: "诗作" },
  { href: "/admin/users", label: "用户" },
  { href: "/admin/invitations", label: "邀请码" },
  { href: "/admin/audit", label: "审计" },
] as const;

/**
 * 管理后台导航（Server Component）：纯 UI，不含任何鉴权逻辑。
 * 整段 /admin 路由已由 admin/layout 的 requireAdmin 守卫，隐藏导航不作为鉴权。
 */
export function AdminNav() {
  return (
    <nav
      aria-label="管理后台导航"
      className="border-b border-border-subtle bg-surface"
    >
      <ul className="mx-auto flex w-full max-w-content flex-wrap items-center gap-1 px-page py-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Button asChild variant="ghost" size="sm">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
