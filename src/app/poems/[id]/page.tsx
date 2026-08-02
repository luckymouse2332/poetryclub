import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { formatPoemDate } from "@/features/posts/formatters";
import { getPublishedPoem } from "@/server/services/poems";
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
  const poem = await getPublishedPoem(parsedId.data);
  return { title: poem?.title ?? "诗作" };
}

export default async function PoemDetailPage({
  params,
}: PoemDetailPageProps) {
  const { id } = await params;
  const parsedId = poemIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  const poem = await getPublishedPoem(parsedId.data);
  if (!poem) {
    notFound();
  }

  return (
    <PageContainer width="reading">
      <PageHeader
        eyebrow="诗作"
        title={poem.title}
        description={`作者：${poem.authorName}`}
      />

      <dl className="mt-6 rounded-lg border border-border-subtle bg-surface-muted px-6 py-4 text-label sm:flex sm:flex-wrap sm:gap-x-8">
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
