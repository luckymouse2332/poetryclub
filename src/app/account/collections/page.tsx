import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { AccountSectionNavigation } from "@/features/auth/components/account-secondary-navigation";
import { OwnCollectionCard } from "@/features/collections/components/own-collection-card";
import { Pagination } from "@/features/posts/components/pagination";
import { requireCurrentUser } from "@/server/auth/session";
import { getAuthoritativeUser } from "@/server/policies/access";
import { listOwnCollections } from "@/server/services/collections";
import { collectionPageSchema } from "@/server/validation/collections";

export const metadata: Metadata = { title: "我的特辑" };

export default async function AccountCollectionsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>) {
  const sessionUser = await requireCurrentUser("/account/collections");
  const currentUser = await getAuthoritativeUser(sessionUser.id);
  const suspended = currentUser?.status === "suspended";
  const query = await searchParams;
  const parsedPage = collectionPageSchema.safeParse(query.page);
  if (!parsedPage.success) notFound();
  const result = await listOwnCollections(sessionUser.id, parsedPage.data);
  if (result.total > 0 && parsedPage.data > result.pageCount) notFound();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="我的作品"
        title="我的特辑"
        description={
          suspended
            ? "账号被禁用期间只能查看已有特辑。"
            : "把相关诗作整理为有序目录，并发布为连续阅读内容。"
        }
        actions={
          !suspended ? (
            <Button asChild><Link href="/account/collections/new">新建特辑</Link></Button>
          ) : undefined
        }
      />
      <AccountSectionNavigation />
      {suspended ? (
        <Alert variant="danger" className="mt-6">
          <AlertDescription>你的账号已被禁用，特辑写操作已关闭。</AlertDescription>
        </Alert>
      ) : null}
      {query.deleted === "1" ? (
        <Alert variant="success" role="status" className="mt-6">
          <AlertDescription>特辑草稿已删除。</AlertDescription>
        </Alert>
      ) : null}
      <Section className="pb-0 pt-8">
        {result.items.length ? (
          <div>
            {result.items.map((collection) => (
              <OwnCollectionCard
                key={collection.id}
                collection={collection}
                suspended={suspended}
              />
            ))}
          </div>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>还没有特辑</EmptyTitle>
              <EmptyDescription>
                新建草稿后，可以从已发布诗作中整理目录。
              </EmptyDescription>
            </EmptyHeader>
            {!suspended ? (
              <EmptyContent>
                <Button asChild><Link href="/account/collections/new">新建特辑</Link></Button>
              </EmptyContent>
            ) : null}
          </Empty>
        )}
      </Section>
      <Pagination basePath="/account/collections" page={result.page} pageCount={result.pageCount} />
    </PageContainer>
  );
}
