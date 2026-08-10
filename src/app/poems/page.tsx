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
import { Pagination } from "@/features/posts/components/pagination";
import { PoemCard } from "@/features/posts/components/poem-card";
import { getContentReaderScope } from "@/server/policies/access";
import { listPublishedPoems } from "@/server/services/poems";
import { pageSchema } from "@/server/validation/poems";

export const metadata: Metadata = {
  title: "诗作",
};

type PoemsPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function PoemsPage({ searchParams }: PoemsPageProps) {
  const query = await searchParams;
  const parsedPage = pageSchema.safeParse(query.page);
  if (!parsedPage.success) {
    notFound();
  }

  const readerScope = await getContentReaderScope();
  const result = await listPublishedPoems(parsedPage.data, readerScope);
  if (result.total > 0 && parsedPage.data > result.pageCount) {
    notFound();
  }

  return (
    <PageContainer>
      <PageHeader
        eyebrow="诗作广场"
        title="诗作"
        description={
          readerScope === "active_member"
            ? "同学们发布的公开与成员诗作，按首次发布时间倒序排列。"
            : "同学们公开发布的诗歌作品，按首次发布时间倒序排列。"
        }
      />
      <Section className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <div>
            {result.items.map((poem) => (
              <PoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>还没有诗作</EmptyTitle>
              <EmptyDescription>
                第一篇作品发布后，会出现在这里。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </Section>
      <Pagination
        basePath="/poems"
        page={result.page}
        pageCount={result.pageCount}
      />
    </PageContainer>
  );
}
