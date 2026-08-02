import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
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
    <PageContainer
      width="narrow"
      className="flex flex-1 flex-col justify-center py-12 md:py-16"
    >
      <PageHeader
        align="center"
        eyebrow="回到诗社"
        title="加入回中诗社"
        description="使用邮箱创建账号或登录，继续记录属于校园的诗意。"
        className="mb-8"
      />
      <AuthForm initialMode={initialMode} nextPath={nextPath} />
    </PageContainer>
  );
}
