import { SecondaryNavigation } from "@/components/secondary-navigation";

const ACCOUNT_NAV_ITEMS = [
  { href: "/account/poems", label: "我的诗作", match: "prefix" },
  { href: "/account", label: "账户", match: "exact" },
] as const;

export function AccountSecondaryNavigation() {
  return (
    <SecondaryNavigation
      ariaLabel="账户导航"
      items={ACCOUNT_NAV_ITEMS}
      className="lg:hidden"
    />
  );
}
