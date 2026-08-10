export const ACCOUNT_NAV_ITEMS = [
  { href: "/account/poems", label: "我的诗作", match: "prefix" },
  { href: "/account", label: "账户信息", match: "exact" },
  { href: "/account/security", label: "账户安全", match: "prefix" },
] as const;
