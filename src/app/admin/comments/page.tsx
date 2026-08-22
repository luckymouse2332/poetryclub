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
import { AdminCommentCard } from "@/features/comments/components/admin-comment-card";
import { AdminFilterForm } from "@/features/moderation/components/admin-filter-form";
import { AdminPagination } from "@/features/moderation/components/admin-pagination";
import { listAdminComments } from "@/server/services/comments";
import { moderationCommentListInputSchema } from "@/server/validation/comments";

export const metadata: Metadata = { title: "评论治理" };

type AdminCommentsPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function AdminCommentsPage({
  searchParams,
}: AdminCommentsPageProps) {
  const parsed = moderationCommentListInputSchema.safeParse(await searchParams);
  if (!parsed.success) notFound();
  const result = await listAdminComments(parsed.data);
  if (result.total > 0 && parsed.data.page > result.pageCount) notFound();
  const activeFilter = Boolean(parsed.data.moderationStatus ?? parsed.data.q);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="管理后台"
        title="评论治理"
        description="管理员可以隐藏或恢复评论，但不能编辑用户正文。每次治理都必须填写原因并写入审计。"
      />
      <div className="mt-6">
        <AdminFilterForm
          basePath="/admin/comments"
          searchPlaceholder="搜索评论、作者或作品"
          hasActiveFilter={activeFilter}
          q={parsed.data.q}
          selects={[
            {
              name: "moderationStatus",
              label: "治理状态",
              value: parsed.data.moderationStatus,
              options: [
                { value: "visible", label: "可见" },
                { value: "hidden", label: "已隐藏" },
              ],
            },
          ]}
        />
      </div>
      <Section className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <div className="divide-y divide-border-subtle">
            {result.items.map((comment) => (
              <div
                key={comment.id}
                className="[&>[data-slot=card]]:rounded-none [&>[data-slot=card]]:border-0 [&>[data-slot=card]]:bg-transparent [&>[data-slot=card]]:shadow-none"
              >
                <AdminCommentCard comment={comment} />
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>没有符合条件的评论</EmptyTitle>
              <EmptyDescription>调整筛选条件后重新查找。</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
      <AdminPagination
        basePath="/admin/comments"
        page={result.page}
        pageCount={result.pageCount}
        query={{
          moderationStatus: parsed.data.moderationStatus,
          q: parsed.data.q,
        }}
      />
    </PageContainer>
  );
}
