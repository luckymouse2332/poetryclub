import { requireAdminOrForbidden } from "@/features/moderation/require-admin";
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
import { AdminCollectionCard } from "@/features/collections/components/admin-collection-card";
import { AdminPagination } from "@/features/moderation/components/admin-pagination";
import { listAdminCollections } from "@/server/services/collections";
import { moderationPageSchema } from "@/server/validation/moderation";

export const metadata: Metadata = { title: "特辑治理" };

export default async function AdminCollectionsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  await requireAdminOrForbidden();
  const query = await searchParams;
  const parsedPage = moderationPageSchema.safeParse(query.page);
  if (!parsedPage.success) notFound();
  const result = await listAdminCollections(parsedPage.data);
  if (result.total > 0 && result.page > result.pageCount) notFound();
  return (
    <PageContainer>
      <PageHeader
        eyebrow="管理后台"
        title="特辑治理"
        description="查看成员整理的特辑，隐藏或恢复不适合展示的标题、简介和编排。"
      />
      <Section className="pb-0 pt-8">
        {result.items.length ? (
          <div>{result.items.map((collection) => <AdminCollectionCard key={collection.id} collection={collection} />)}</div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>还没有特辑</EmptyTitle>
              <EmptyDescription>成员创建特辑后会出现在这里。</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
      <AdminPagination basePath="/admin/collections" page={result.page} pageCount={result.pageCount} query={{}} />
    </PageContainer>
  );
}
