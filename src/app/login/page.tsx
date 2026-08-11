import type { Metadata } from "next";

import { AuthSplitShell } from "@/components/layout/auth-split-shell";
import { AuthForm } from "@/features/auth/components/auth-form";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "登录",
};

type LoginPageProps = Readonly<{
  searchParams: Promise<{
    mode?: string | string[];
    next?: string | string[];
    passwordReset?: string | string[];
  }>;
}>;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const initialMode = query.mode === "sign-up" ? "sign-up" : "sign-in";
  const nextPath = getSafeRedirectPath(query.next);
  const passwordReset = query.passwordReset === "success";

  return (
    <AuthSplitShell
      eyebrow="回到诗社"
      title="加入回中诗社"
      description="使用邮箱登录；新同学需要有效邀请码才能创建账号。"
      note="这里保存三年里留下的诗和共同记忆。登录后可以管理自己的草稿，并阅读成员作品。"
    >
      <AuthForm
        initialMode={initialMode}
        nextPath={nextPath}
        initialNotice={passwordReset ? "密码已重置，请使用新密码登录。" : undefined}
        cleanPasswordResetNotice={passwordReset}
      />
    </AuthSplitShell>
  );
}
