import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import {
  formatCreatedAt,
  getUserDisplayName,
} from "@/features/auth/user-display";
import { requireCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";

export const metadata: Metadata = {
  title: "账号",
};

export default async function AccountPage() {
  const sessionUser = await requireCurrentUser("/account");
  const currentUser = await getAuthoritativeUser(sessionUser.id);

  if (!currentUser) {
    return (
      <PageContainer width="narrow">
        <PageHeader
          eyebrow="个人档案"
          title="账户"
          description="查看当前登录身份。账户信息来自受保护的服务端会话。"
        />
        <p
          role="alert"
          className="mt-6 rounded-md border border-danger bg-danger-surface p-4 text-label text-danger"
        >
          无法确认当前账号状态，请重新登录后再试。
        </p>
      </PageContainer>
    );
  }

  const suspended = currentUser.status === "suspended";

  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="个人档案"
        title="账户"
        description="查看当前登录身份。账户信息来自受保护的服务端会话。"
      />

      {suspended ? (
        <p
          role="alert"
          className="mt-6 rounded-md border border-danger bg-danger-surface p-4 text-label text-danger"
        >
          你的账号已被管理员禁用，目前只能浏览内容，不能新建、编辑、发布或删除诗作。
          {currentUser.suspensionReason
            ? `原因：${currentUser.suspensionReason}`
            : null}
        </p>
      ) : null}

      <Section title="基本信息" className="pb-0 pt-8">
        <Surface variant="paper">
          <dl className="divide-y divide-border-subtle text-label">
            <AccountDetail label="显示名称" value={getUserDisplayName(currentUser)} />
            <AccountDetail label="邮箱" value={currentUser.email} breakAll />
            <AccountDetail
              label="注册时间"
              value={formatCreatedAt(currentUser.createdAt)}
            />
            <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <dt className="text-subtle">认证状态</dt>
              <dd>
                <Badge variant="success">已登录</Badge>
              </dd>
            </div>
            <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <dt className="text-subtle">角色</dt>
              <dd>
                <Badge variant={currentUser.role === "admin" ? "primary" : "neutral"}>
                  {currentUser.role === "admin" ? "管理员" : "成员"}
                </Badge>
              </dd>
            </div>
            <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <dt className="text-subtle">账号状态</dt>
              <dd>
                <Badge variant={suspended ? "danger" : "success"}>
                  {suspended ? "已禁用" : "正常"}
                </Badge>
              </dd>
            </div>
          </dl>
        </Surface>
      </Section>

      <Section title="我的作品" className="pb-0 pt-8">
        <p className="text-body text-subtle">
          {suspended
            ? "你的账号已被禁用，目前只能浏览已有内容，不能新建或编辑诗作。"
            : "发布、编辑与撤回你的诗歌作品。"}
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link href="/account/poems">管理我的诗作</Link>
          </Button>
        </div>
      </Section>

      <Section title="账户安全" className="pb-0 pt-8">
        <p className="text-body text-subtle">
          验证当前密码后可以设置新密码，并撤销其他设备上的登录会话。
        </p>
        <div className="mt-4">
          <Button asChild variant="secondary">
            <Link href="/account/security">管理账户安全</Link>
          </Button>
        </div>
      </Section>
    </PageContainer>
  );
}

type AccountDetailProps = Readonly<{
  label: string;
  value: string;
  breakAll?: boolean;
}>;

function AccountDetail({ label, value, breakAll = false }: AccountDetailProps) {
  return (
    <div className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-subtle">{label}</dt>
      <dd className={breakAll ? "break-all font-medium" : "font-medium"}>
        {value}
      </dd>
    </div>
  );
}
