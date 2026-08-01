import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "登录",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">加入回中诗社</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          使用邮箱创建账号或登录。M0 暂不提供找回密码与邮箱验证。
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
