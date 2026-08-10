import { SecondaryNavigation } from "@/components/secondary-navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "总览", match: "exact" },
  { href: "/admin/poems", label: "诗作", match: "prefix" },
  { href: "/admin/users", label: "用户", match: "prefix" },
  { href: "/admin/invitations", label: "邀请码", match: "prefix" },
  { href: "/admin/announcements", label: "公告", match: "prefix" },
  { href: "/admin/audit", label: "审计", match: "prefix" },
] as const;

/**
 * 管理后台导航（Server Component）：纯 UI，不含任何鉴权逻辑。
 * 整段 /admin 路由已由 admin/layout 的 requireAdmin 守卫，隐藏导航不作为鉴权。
 */
export function AdminNav() {
  return <SecondaryNavigation ariaLabel="管理后台导航" items={NAV_ITEMS} />;
}
