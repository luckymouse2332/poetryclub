import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { OwnPoemCard } from "@/features/posts/components/own-poem-card";
import { Pagination } from "@/features/posts/components/pagination";
import { requireCurrentUser } from "@/server/auth/session";
import { listOwnPoems } from "@/server/services/poems";
import { pageSchema } from "@/server/validation/poems";

export const metadata: Metadata = {
  title: "我的诗作",
};

type AccountPoemsPageProps = Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export default async function AccountPoemsPage({
  searchParams,
}: AccountPoemsPageProps) {
  const user = await requireCurrentUser("/account/poems");

  const query = await searchParams;
  const parsedPage = pageSchema.safeParse(query.page);
  if (!parsedPage.success) {
    notFound();
  }

  const result = await listOwnPoems(user.id, parsedPage.data);
  if (result.total > 0 && parsedPage.data > result.pageCount) {
    notFound();
  }

  const notice = query.deleted === "1" ? "草稿已删除。" : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="我的作品"
        title="我的诗作"
        description="管理你的草稿与已发布诗作。发布后才会对所有人可见。"
        actions={
          <Button asChild>
            <Link href="/account/poems/new">新建诗作</Link>
          </Button>
        }
      />

      {notice ? (
        <p
          role="status"
          className="mt-6 rounded-md border border-success bg-success-surface p-3 text-label text-success"
        >
          {notice}
        </p>
      ) : null}

      <Section className="pb-0 pt-8">
        {result.items.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {result.items.map((poem) => (
              <OwnPoemCard key={poem.id} poem={poem} />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>还没有诗作</EmptyTitle>
              <EmptyDescription>
                新建一首草稿，写好后可以随时发布。
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/account/poems/new">新建诗作</Link>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </Section>
      <Pagination
        basePath="/account/poems"
        page={result.page}
        pageCount={result.pageCount}
      />
    </PageContainer>
  );
}
