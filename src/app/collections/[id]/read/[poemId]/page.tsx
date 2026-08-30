import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollectionLoginGate } from "@/features/collections/components/collection-login-gate";
import { formatPoemDate } from "@/features/posts/formatters";
import { getContentViewer } from "@/server/policies/access";
import { getCollectionReadingItem } from "@/server/services/collections";
import { collectionIdSchema } from "@/server/validation/collections";
import { poemIdSchema } from "@/server/validation/poems";

type ReadingPageProps = Readonly<{
  params: Promise<{ id: string; poemId: string }>;
}>;

export async function generateMetadata({ params }: ReadingPageProps): Promise<Metadata> {
  const values = await params;
  const collectionId = collectionIdSchema.safeParse(values.id);
  const poemId = poemIdSchema.safeParse(values.poemId);
  if (!collectionId.success || !poemId.success) return { title: "特辑阅读" };
  const viewer = await getContentViewer();
  const result = await getCollectionReadingItem(
    collectionId.data,
    poemId.data,
    viewer.scope,
  );
  return { title: result.kind === "visible" ? result.item.poem.title : "特辑阅读" };
}

export default async function CollectionReadingPage({ params }: ReadingPageProps) {
  const values = await params;
  const collectionId = collectionIdSchema.safeParse(values.id);
  const poemId = poemIdSchema.safeParse(values.poemId);
  if (!collectionId.success || !poemId.success) notFound();
  const viewer = await getContentViewer();
  const result = await getCollectionReadingItem(
    collectionId.data,
    poemId.data,
    viewer.scope,
  );
  if (result.kind === "not_found") notFound();
  if (result.kind === "login_required") {
    const nextPath = `/collections/${collectionId.data}/read/${poemId.data}`;
    return (
      <PageContainer width="reading">
        <div aria-hidden="true" className="select-none blur-sm">
          <PageHeader eyebrow="特辑阅读" title="成员作品" />
          <div className="mt-8 h-72 rounded-lg border border-border-subtle bg-paper" />
        </div>
        <CollectionLoginGate nextPath={nextPath} />
      </PageContainer>
    );
  }
  const { collection, poem: current, previousPoemId, nextPoemId } = result.item;

  return (
    <PageContainer width="reading">
      <nav aria-label="特辑位置" className="mb-6 text-label text-subtle">
        <Link href={`/collections/${collection.id}`} className="hover:text-foreground">
          {collection.title}
        </Link>
        <span aria-hidden="true" className="mx-2">/</span>
        <span aria-current="page">连续阅读</span>
      </nav>
      <PageHeader eyebrow="特辑阅读" title={current.title} description={`作者：${current.authorName}`} />
      <dl className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border-subtle py-3 text-label">
        {current.visibility === "members_only" ? (
          <Badge variant="neutral">仅成员可见</Badge>
        ) : null}
        <div className="flex gap-2">
          <dt className="text-subtle">发布时间</dt>
          <dd>{formatPoemDate(current.publishedAt)}</dd>
        </div>
        {current.occurredAt ? (
          <div className="flex gap-2">
            <dt className="text-subtle">事件日期</dt>
            <dd>{formatPoemDate(current.occurredAt)}</dd>
          </div>
        ) : null}
      </dl>
      <article
        aria-label={current.title}
        className="mt-10 whitespace-pre-wrap border-l border-border-subtle pl-6 font-serif text-body-lg leading-reading text-foreground md:pl-10"
      >
        {current.body}
      </article>
      {current.context ? (
        <section aria-labelledby="collection-poem-context" className="mt-8">
          <h2 id="collection-poem-context" className="text-section-title font-semibold text-foreground">
            创作背景
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-body text-subtle">{current.context}</p>
        </section>
      ) : null}
      <div className="mt-12 flex flex-wrap justify-between gap-3 border-t border-border-subtle pt-6">
        {previousPoemId ? (
          <Button asChild variant="secondary">
            <Link href={`/collections/${collection.id}/read/${previousPoemId}`}>上一篇</Link>
          </Button>
        ) : <span />}
        <Button asChild variant="ghost">
          <Link href={`/collections/${collection.id}`}>返回目录</Link>
        </Button>
        {nextPoemId ? (
          <Button asChild variant="secondary">
            <Link href={`/collections/${collection.id}/read/${nextPoemId}`}>下一篇</Link>
          </Button>
        ) : <span />}
      </div>
      <p className="mt-6 text-center text-label text-subtle">
        <Link href={`/poems/${current.id}`} className="underline underline-offset-4 hover:text-foreground">
          查看作品详情与评论
        </Link>
      </p>
    </PageContainer>
  );
}
