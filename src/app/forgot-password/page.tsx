import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "忘记密码",
};

export default function ForgotPasswordPage() {
  return (
    <PageContainer
      width="narrow"
      className="flex flex-1 flex-col justify-center py-12 md:py-16"
    >
      <PageHeader
        align="center"
        eyebrow="账户恢复"
        title="找回密码"
        description="提交注册邮箱后，我们会发送一封一小时内有效的密码重置邮件。"
        className="mb-8"
      />
      <ForgotPasswordForm />
    </PageContainer>
  );
}
