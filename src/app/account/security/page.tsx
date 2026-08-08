import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { requireCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "账户安全",
};

export default async function AccountSecurityPage() {
  await requireCurrentUser("/account/security");

  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="账户安全"
        title="修改密码"
        description="验证当前密码后设置新密码。更新成功后，其他设备上的登录会话将失效。"
      />
      <div className="mt-8">
        <ChangePasswordForm />
      </div>
      <div className="mt-6">
        <Button asChild variant="ghost">
          <Link href="/account">返回账户</Link>
        </Button>
      </div>
    </PageContainer>
  );
}
