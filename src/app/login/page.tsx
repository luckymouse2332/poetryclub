import type { Metadata } from "next";

import { AuthForm } from "@/features/auth/components/auth-form";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "登录",
};

type LoginPageProps = Readonly<{
  searchParams: Promise<{
    mode?: string | string[];
    next?: string | string[];
  }>;
}>;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const initialMode = query.mode === "sign-up" ? "sign-up" : "sign-in";
  const nextPath = getSafeRedirectPath(query.next);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">加入回中诗社</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          使用邮箱创建账号或登录。M0 暂不提供找回密码与邮箱验证。
        </p>
      </div>
      <AuthForm initialMode={initialMode} nextPath={nextPath} />
    </div>
  );
}
