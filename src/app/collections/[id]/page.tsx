import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { CollectionLoginGate } from "@/features/collections/components/collection-login-gate";
import { Pagination } from "@/features/posts/components/pagination";
import { formatPoemDate } from "@/features/posts/formatters";
import { getContentViewer } from "@/server/policies/access";
import {
  getPublishedCollectionAccess,
  listPublishedCollectionItems,
} from "@/server/services/collections";
import {
  collectionIdSchema,
  collectionPageSchema,
} from "@/server/validation/collections";

type CollectionPageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}>;

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const parsed = collectionIdSchema.safeParse(id);
  if (!parsed.success) return { title: "特辑" };
  const viewer = await getContentViewer();
  const result = await getPublishedCollectionAccess(parsed.data, viewer.scope);
  return {
    title: result.kind === "visible" ? result.collection.title : "特辑",
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: CollectionPageProps) {
  const { id } = await params;
  const parsedId = collectionIdSchema.safeParse(id);
  const query = await searchParams;
  const parsedPage = collectionPageSchema.safeParse(query.page);
  if (!parsedId.success || !parsedPage.success) notFound();
  const viewer = await getContentViewer();
  const result = await listPublishedCollectionItems(
    parsedId.data,
    parsedPage.data,
    viewer.scope,
  );
  if (result.kind === "not_found") notFound();
  if (result.kind === "login_required") {
    return (
      <PageContainer width="reading">
        <div aria-hidden="true" className="select-none blur-sm">
          <PageHeader eyebrow="特辑" title="成员特辑" description="登录后继续阅读" />
          <div className="mt-8 h-72 rounded-lg border border-border-subtle bg-paper" />
        </div>
        <CollectionLoginGate nextPath={`/collections/${parsedId.data}`} />
      </PageContainer>
    );
  }
  if (result.directory.total > 0 && parsedPage.data > result.directory.pageCount) {
    notFound();
  }
  const { collection, directory } = result;

  return (
    <PageContainer width="reading">
      <PageHeader
        eyebrow="特辑"
        title={collection.title}
        description={`整理：${collection.ownerName}`}
      />
      <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border-subtle py-3 text-label">
        {collection.visibility === "members_only" ? (
          <Badge variant="neutral">仅成员可见</Badge>
        ) : null}
        <div className="flex gap-2">
          <dt className="text-subtle">首次发布</dt>
          <dd>{formatPoemDate(collection.publishedAt)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-subtle">当前可读</dt>
          <dd>{collection.itemCount} 篇</dd>
        </div>
      </dl>
      {collection.description ? (
        <p className="mt-8 whitespace-pre-wrap text-body-lg leading-copy text-foreground">
          {collection.description}
        </p>
      ) : null}
      <section aria-labelledby="collection-directory-title" className="mt-12">
        <h2
          id="collection-directory-title"
          className="font-serif text-section-title font-normal text-foreground"
        >
          目录
        </h2>
        {directory.items.length > 0 ? (
          <ol
            start={(directory.page - 1) * 12 + 1}
            className="mt-4 list-decimal divide-y divide-border-subtle border-y border-border-subtle pl-10"
          >
            {directory.items.map((item) => (
              <li key={item.poemId} className="py-5 pl-2 marker:text-subtle">
                <Link
                  href={`/collections/${collection.id}/read/${item.poemId}`}
                  className="font-serif text-body-lg text-foreground underline decoration-1 decoration-transparent underline-offset-[0.28em] transition-[color,text-decoration-color] duration-150 hover:text-seal-foreground hover:decoration-seal focus-visible:text-seal-foreground focus-visible:decoration-seal"
                >
                  《{item.title}》
                </Link>
                <span className="ml-3 text-label text-subtle">{item.authorName}</span>
              </li>
            ))}
          </ol>
        ) : (
          <Empty className="mt-6">
            <EmptyHeader>
              <EmptyTitle>当前没有可读作品</EmptyTitle>
              <EmptyDescription>
                已撤回、被隐藏或访问范围不兼容的作品不会显示。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        <Pagination
          basePath={`/collections/${collection.id}`}
          page={directory.page}
          pageCount={directory.pageCount}
        />
      </section>
      {directory.total !== collection.itemCount ? (
        <Alert variant="warning" className="mt-8">
          <AlertDescription>
            目录会自动跳过当前不可读的作品，不显示其标题或位置。
          </AlertDescription>
        </Alert>
      ) : null}
    </PageContainer>
  );
}
