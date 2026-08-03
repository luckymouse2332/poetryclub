import type { Metadata } from "next";
import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUserDisplayName } from "@/features/auth/user-display";
import { requireAdminOrForbidden } from "@/features/moderation/require-admin";

export const metadata: Metadata = {
  title: "管理后台",
};

const SECTIONS = [
  {
    href: "/admin/poems",
    title: "诗作治理",
    description: "隐藏或恢复诗作，查看作者状态与治理状态。",
  },
  {
    href: "/admin/users",
    title: "用户管理",
    description: "禁用 / 恢复账号，调整管理员角色。",
  },
  {
    href: "/admin/invitations",
    title: "邀请码",
    description: "创建受控注册邀请码，并管理其状态。",
  },
  {
    href: "/admin/audit",
    title: "审计日志",
    description: "只读查看最近的管理动作记录。",
  },
] as const;

export default async function AdminDashboardPage() {
  const admin = await requireAdminOrForbidden();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="管理后台"
        title="管理后台"
        description={`欢迎回来，${getUserDisplayName(admin)}。这里管理诗作、用户与邀请码，所有变更都会写入审计日志。`}
      />
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <Card key={section.href}>
            <CardHeader>
              <CardTitle>
                <Link
                  href={section.href}
                  className="rounded-sm no-underline transition-colors hover:text-primary"
                >
                  {section.title}
                </Link>
              </CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
