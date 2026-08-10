import type { Metadata } from "next";

import { AuthSplitShell } from "@/components/layout/auth-split-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
  title: "忘记密码",
};

export default function ForgotPasswordPage() {
  return (
    <AuthSplitShell
      eyebrow="账户恢复"
      title="找回密码"
      description="提交注册邮箱后，我们会发送一封一小时内有效的密码重置邮件。"
      note="重置链接只会发送到已注册邮箱。为保护账户，我们不会在页面上说明邮箱是否存在。"
    >
      <ForgotPasswordForm />
    </AuthSplitShell>
  );
}
