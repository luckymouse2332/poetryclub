import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { AdminFilterForm } from "@/features/moderation/components/admin-filter-form";
import { AdminPagination } from "@/features/moderation/components/admin-pagination";
import { AdminUserCard } from "@/features/moderation/components/admin-user-card";
import { requireAdminOrForbidden } from "@/features/moderation/require-admin";
import { listAdminUsers } from "@/server/services/moderation";
import { moderationUserListInputSchema } from "@/server/validation/moderation";

export const metadata: Metadata = {
  title: "用户管理",
};

type AdminUsersPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const query = await searchParams;
  const parsed = moderationUserListInputSchema.safeParse(query);
  if (!parsed.success) {
    notFound();
  }

  const result = await listAdminUsers(parsed.data);
  if (result.total > 0 && parsed.data.page > result.pageCount) {
    notFound();
  }

  // 页面入口独立执行管理员授权，不能只依赖父布局。
  await requireAdminOrForbidden();

  const activeFilter = Boolean(
    parsed.data.q ?? parsed.data.role ?? parsed.data.status,
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="管理后台"
        title="用户管理"
        description="禁用 / 恢复账号、调整管理员角色。账号状态与角色变更都需要填写原因并二次确认。"
      />
      <div className="mt-6">
        <AdminFilterForm
          basePath="/admin/users"
          searchPlaceholder="搜索昵称或邮箱"
          hasActiveFilter={activeFilter}
          q={parsed.data.q}
          selects={[
            {
              name: "role",
              label: "角色",
              value: parsed.data.role,
              options: [
                { value: "member", label: "成员" },
                { value: "admin", label: "管理员" },
              ],
            },
            {
              name: "status",
              label: "账号状态",
              value: parsed.data.status,
              options: [
                { value: "active", label: "正常" },
                { value: "suspended", label: "已禁用" },
              ],
            },
          ]}
        />
      </div>
      <Section className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {result.items.map((user) => (
              <div
                key={user.id}
                className="[&>[data-slot=card]]:rounded-none [&>[data-slot=card]]:border-0 [&>[data-slot=card]]:bg-transparent [&>[data-slot=card]]:shadow-none"
              >
                <AdminUserCard user={user} />
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>没有符合条件的用户</EmptyTitle>
              <EmptyDescription>调整筛选条件后重新查找。</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
      <AdminPagination
        basePath="/admin/users"
        page={result.page}
        pageCount={result.pageCount}
        query={{
          q: parsed.data.q,
          role: parsed.data.role,
          status: parsed.data.status,
        }}
      />
    </PageContainer>
  );
}
