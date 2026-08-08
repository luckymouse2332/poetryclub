import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { isPasswordResetTokenValid } from "@/server/auth/password-reset";

export const metadata: Metadata = {
  title: "重置密码",
  referrer: "no-referrer",
};

type ResetPasswordPageProps = Readonly<{
  searchParams: Promise<{
    token?: string | string[];
    error?: string | string[];
  }>;
}>;

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const query = await searchParams;
  const error = typeof query.error === "string" ? query.error : undefined;
  const token = typeof query.token === "string" ? query.token : undefined;
  const requestHeaders = await headers();
  const tokenValid = token
    ? await isPasswordResetTokenValid(
        token,
        requestHeaders.get("x-forwarded-for"),
      )
    : false;

  return (
    <PageContainer
      width="narrow"
      className="flex flex-1 flex-col justify-center py-12 md:py-16"
    >
      <PageHeader
        align="center"
        eyebrow="账户恢复"
        title="设置新密码"
        description="重置成功后，所有旧登录会话都会失效。请使用新密码重新登录。"
        className="mb-8"
      />

      {tokenValid && token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <Surface className="w-full text-center" aria-label="重置链接状态">
          <p className="text-body text-foreground" role="alert">
            {error || token
              ? "这个重置链接无效、已过期或已经使用，请重新申请。"
              : "重置链接不完整，请重新申请密码重置邮件。"}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/forgot-password">重新申请</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/login">返回登录</Link>
            </Button>
          </div>
        </Surface>
      )}
    </PageContainer>
  );
}
