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
import { AdminPoemCard } from "@/features/moderation/components/admin-poem-card";
import { listAdminPoems } from "@/server/services/moderation";
import { moderationPoemListInputSchema } from "@/server/validation/moderation";

export const metadata: Metadata = {
  title: "诗作治理",
};

type AdminPoemsPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function AdminPoemsPage({
  searchParams,
}: AdminPoemsPageProps) {
  const query = await searchParams;
  const parsed = moderationPoemListInputSchema.safeParse(query);
  if (!parsed.success) {
    notFound();
  }

  const result = await listAdminPoems(parsed.data);
  if (result.total > 0 && parsed.data.page > result.pageCount) {
    notFound();
  }

  const activeFilter = Boolean(
    parsed.data.q ?? parsed.data.status ?? parsed.data.moderationStatus,
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow="管理后台"
        title="诗作治理"
        description="按作者状态与治理状态筛选诗作。隐藏不合适的作品并填写原因，隐藏与恢复都会记入审计日志。"
      />
      <div className="mt-6">
        <AdminFilterForm
          basePath="/admin/poems"
          searchPlaceholder="搜索标题、作者或邮箱"
          hasActiveFilter={activeFilter}
          q={parsed.data.q}
          selects={[
            {
              name: "status",
              label: "作者状态",
              value: parsed.data.status,
              options: [
                { value: "draft", label: "草稿" },
                { value: "published", label: "已发布" },
              ],
            },
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
            {result.items.map((poem) => (
              <div
                key={poem.id}
                className="[&>[data-slot=card]]:rounded-none [&>[data-slot=card]]:border-0 [&>[data-slot=card]]:bg-transparent [&>[data-slot=card]]:shadow-none"
              >
                <AdminPoemCard poem={poem} />
              </div>
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>没有符合条件的诗作</EmptyTitle>
              <EmptyDescription>
                调整筛选条件后重新查找，或等待新的作品发布。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
      <AdminPagination
        basePath="/admin/poems"
        page={result.page}
        pageCount={result.pageCount}
        query={{
          q: parsed.data.q,
          status: parsed.data.status,
          moderationStatus: parsed.data.moderationStatus,
        }}
      />
    </PageContainer>
  );
}
