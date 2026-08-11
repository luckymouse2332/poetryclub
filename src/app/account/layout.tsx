import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ACCOUNT_NAV_ITEMS } from "@/features/auth/components/account-secondary-navigation";

export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <WorkspaceShell
      ariaLabel="账户导航"
      items={ACCOUNT_NAV_ITEMS}
    >
      {children}
    </WorkspaceShell>
  );
}
