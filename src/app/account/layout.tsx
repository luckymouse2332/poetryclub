import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ACCOUNT_NAV_ITEMS } from "@/features/auth/components/account-secondary-navigation";

export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <WorkspaceShell
      title="个人工作区"
      eyebrow="MEMBER DESK"
      ariaLabel="账户导航"
      items={ACCOUNT_NAV_ITEMS}
      showMobileNavigation={false}
    >
      {children}
    </WorkspaceShell>
  );
}
