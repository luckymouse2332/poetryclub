import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/surface";
import {
  formatCreatedAt,
  getUserDisplayName,
} from "@/features/auth/user-display";
import { requireCurrentUser } from "@/server/auth/session";

export const metadata: Metadata = {
  title: "账号",
};

export default async function AccountPage() {
  const user = await requireCurrentUser("/account");

  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow="个人档案"
        title="账户"
        description="查看当前登录身份。账户信息来自受保护的服务端会话。"
      />
      <Section title="基本信息" className="pb-0 pt-8">
        <Surface variant="paper">
          <dl className="divide-y divide-border-subtle text-label">
            <AccountDetail label="显示名称" value={getUserDisplayName(user)} />
            <AccountDetail label="邮箱" value={user.email} breakAll />
            <AccountDetail
              label="注册时间"
              value={formatCreatedAt(user.createdAt)}
            />
            <div className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <dt className="text-subtle">认证状态</dt>
              <dd>
                <Badge variant="success">已登录</Badge>
              </dd>
            </div>
          </dl>
        </Surface>
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
