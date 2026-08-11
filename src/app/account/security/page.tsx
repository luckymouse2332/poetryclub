import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AccountSectionNavigation } from "@/features/auth/components/account-secondary-navigation";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { requireCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "账户安全",
};

export default async function AccountSecurityPage() {
  await requireCurrentUser("/account/security");

  return (
    <PageContainer>
      <PageHeader
        eyebrow="账户安全"
        title="修改密码"
        description="验证当前密码后设置新密码。更新成功后，其他设备上的登录会话将失效。"
      />
      <AccountSectionNavigation />
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(16rem,0.65fr)_minmax(24rem,1.35fr)]">
        <aside className="border-l-2 border-seal pl-5 text-label leading-copy text-subtle">
          <p>修改成功后，当前设备继续保持登录，其他设备上的会话将失效。</p>
          <Button asChild variant="ghost" className="mt-4 -ml-3">
            <Link href="/account">返回账户信息</Link>
          </Button>
        </aside>
        <div className="min-w-0">
          <ChangePasswordForm />
        </div>
      </div>
    </PageContainer>
  );
}
