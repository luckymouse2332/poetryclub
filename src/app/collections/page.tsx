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
import { CollectionCard } from "@/features/collections/components/collection-card";
import { Pagination } from "@/features/posts/components/pagination";
import { getContentReaderScope } from "@/server/policies/access";
import { listPublishedCollections } from "@/server/services/collections";
import { collectionPageSchema } from "@/server/validation/collections";

export const metadata: Metadata = { title: "特辑" };

export default async function CollectionsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  const query = await searchParams;
  const parsedPage = collectionPageSchema.safeParse(query.page);
  if (!parsedPage.success) notFound();
  const scope = await getContentReaderScope();
  const result = await listPublishedCollections(parsedPage.data, scope);
  if (result.total > 0 && parsedPage.data > result.pageCount) notFound();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="作品编排"
        title="特辑"
        description={
          scope === "active_member"
            ? "按主题和顺序整理的公开与成员作品。"
            : "按主题和顺序整理的公开作品。"
        }
      />
      <Section className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <div>
            {result.items.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>还没有特辑</EmptyTitle>
              <EmptyDescription>
                第一份特辑发布后，会出现在这里。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
      <Pagination
        basePath="/collections"
        page={result.page}
        pageCount={result.pageCount}
      />
    </PageContainer>
  );
}
