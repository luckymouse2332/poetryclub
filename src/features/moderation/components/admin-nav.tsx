export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "总览", match: "exact" },
  { href: "/admin/poems", label: "诗作", match: "prefix" },
  { href: "/admin/users", label: "用户", match: "prefix" },
  { href: "/admin/invitations", label: "邀请码", match: "prefix" },
  { href: "/admin/announcements", label: "公告", match: "prefix" },
  { href: "/admin/audit", label: "审计", match: "prefix" },
] as const;
