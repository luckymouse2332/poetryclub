import { AccountSecondaryNavigation } from "@/features/auth/components/account-secondary-navigation";

export default async function AccountLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-full">
      <AccountSecondaryNavigation />
      {children}
    </div>
  );
}
