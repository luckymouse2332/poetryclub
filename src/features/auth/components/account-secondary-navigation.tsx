import { SecondaryNavigation } from "@/components/secondary-navigation";

export const ACCOUNT_NAV_ITEMS = [
  { href: "/account/poems", label: "我的诗作", match: "prefix" },
  { href: "/account", label: "账户信息", match: "exact" },
  { href: "/account/security", label: "账户安全", match: "prefix" },
] as const;

/** 账户页正文内的移动 / 平板二级导航；桌面由 WorkspaceShell 常驻侧栏承载。 */
export function AccountSectionNavigation() {
  return (
    <SecondaryNavigation
      ariaLabel="账户导航"
      items={ACCOUNT_NAV_ITEMS}
      variant="embedded"
      className="mt-6 xl:hidden"
    />
  );
}
