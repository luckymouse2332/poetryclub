import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { MemberLoginGate } from "@/features/posts/components/member-login-gate";
import { formatPoemDate } from "@/features/posts/formatters";
import { getContentReaderScope } from "@/server/policies/access";
import { getPublishedPoemAccess } from "@/server/services/poems";
import { poemIdSchema } from "@/server/validation/poems";

type PoemDetailPageProps = Readonly<{
  params: Promise<{ id: string }>;
}>;

export async function generateMetadata({
  params,
}: PoemDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const parsedId = poemIdSchema.safeParse(id);
  if (!parsedId.success) {
    return { title: "诗作" };
  }
  const readerScope = await getContentReaderScope();
  const result = await getPublishedPoemAccess(parsedId.data, readerScope);
  return { title: result.kind === "visible" ? result.poem.title : "诗作" };
}

export default async function PoemDetailPage({
  params,
}: PoemDetailPageProps) {
  const { id } = await params;
  const parsedId = poemIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  const readerScope = await getContentReaderScope();
  const result = await getPublishedPoemAccess(parsedId.data, readerScope);
  if (result.kind === "not_found") {
    notFound();
  }

  if (result.kind === "login_required") {
    return (
      <PageContainer width="reading">
        <div
          aria-hidden="true"
          className="pointer-events-none select-none blur-sm"
        >
          <PageHeader
            eyebrow="诗作"
            title="成员作品"
            description="登录后继续阅读"
          />
          <div className="mt-6 h-20 rounded-lg border border-border-subtle bg-surface-muted" />
          <article className="mt-8 space-y-4 rounded-lg border border-border-subtle bg-paper p-6 shadow-card md:p-8">
            <div className="h-4 w-4/5 rounded bg-surface-muted" />
            <div className="h-4 w-full rounded bg-surface-muted" />
            <div className="h-4 w-3/5 rounded bg-surface-muted" />
            <div className="h-4 w-11/12 rounded bg-surface-muted" />
          </article>
        </div>
        <MemberLoginGate nextPath={`/poems/${parsedId.data}`} />
      </PageContainer>
    );
  }

  const poem = result.poem;

  return (
    <PageContainer width="reading">
      <PageHeader
        eyebrow="诗作"
        title={poem.title}
        description={`作者：${poem.authorName}`}
      />

      <dl className="mt-6 rounded-lg border border-border-subtle bg-surface-muted px-6 py-4 text-label sm:flex sm:flex-wrap sm:gap-x-8">
        {poem.visibility === "members_only" ? (
          <div className="flex items-center py-1">
            <Badge variant="neutral">仅成员可见</Badge>
          </div>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-x-2 py-1">
          <dt className="text-subtle">发布时间</dt>
          <dd className="font-medium text-foreground">
            {formatPoemDate(poem.publishedAt)}
          </dd>
        </div>
        {poem.occurredAt ? (
          <div className="flex flex-wrap items-baseline gap-x-2 py-1">
            <dt className="text-subtle">事件日期</dt>
            <dd className="font-medium text-foreground">
              {formatPoemDate(poem.occurredAt)}
            </dd>
          </div>
        ) : null}
        <div className="flex flex-wrap items-baseline gap-x-2 py-1">
          <dt className="text-subtle">最后更新</dt>
          <dd className="font-medium text-foreground">
            {formatPoemDate(poem.updatedAt)}
          </dd>
        </div>
      </dl>

      <article
        aria-label={poem.title}
        className="mt-8 whitespace-pre-wrap rounded-lg border border-border-subtle bg-paper p-6 font-serif text-body-lg text-foreground shadow-card md:p-8"
      >
        {poem.body}
      </article>

      {poem.context ? (
        <section aria-labelledby="poem-context-title" className="mt-8">
          <h2
            id="poem-context-title"
            className="text-section-title font-semibold text-foreground"
          >
            创作背景
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-body text-subtle">
            {poem.context}
          </p>
        </section>
      ) : null}
    </PageContainer>
  );
}
