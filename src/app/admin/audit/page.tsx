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
import { AdminAuditCard } from "@/features/moderation/components/admin-audit-card";
import { AdminPagination } from "@/features/moderation/components/admin-pagination";
import { listAuditLogs } from "@/server/services/moderation";
import { moderationPageSchema } from "@/server/validation/moderation";

export const metadata: Metadata = {
  title: "审计日志",
};

type AdminAuditPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function AdminAuditPage({
  searchParams,
}: AdminAuditPageProps) {
  const query = await searchParams;
  const parsedPage = moderationPageSchema.safeParse(query.page);
  if (!parsedPage.success) {
    notFound();
  }

  const result = await listAuditLogs(parsedPage.data);
  if (result.total > 0 && parsedPage.data > result.pageCount) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="管理后台"
        title="审计日志"
        description="所有管理操作的只读记录，按时间倒序排列。日志不可编辑或删除。"
      />
      <Section className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {result.items.map((entry) => (
              <AdminAuditCard key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>还没有审计记录</EmptyTitle>
              <EmptyDescription>
                完成第一条管理操作后，会显示在这里。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
      <AdminPagination
        basePath="/admin/audit"
        page={result.page}
        pageCount={result.pageCount}
        query={{}}
      />
    </PageContainer>
  );
}
