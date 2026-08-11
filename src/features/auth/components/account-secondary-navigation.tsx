import { SecondaryNavigation } from "@/components/secondary-navigation";

export const ACCOUNT_NAV_ITEMS = [
  { href: "/account/poems", label: "我的诗作", match: "prefix" },
  { href: "/account", label: "账户信息", match: "exact" },
  { href: "/account/security", label: "账户安全", match: "prefix" },
] as const;

/** 账户页正文内的移动二级导航；lg 起由 WorkspaceShell 统一承载。 */
export function AccountSectionNavigation() {
  return (
    <SecondaryNavigation
      ariaLabel="账户导航"
      items={ACCOUNT_NAV_ITEMS}
      variant="embedded"
      className="mt-6 lg:hidden"
    />
  );
}
