import { PoemReading, ReadingContext } from "@/components/poem-reading";
import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "@/features/comments/components/comment-ui";
import { MemberLoginGate } from "@/features/posts/components/member-login-gate";
import { formatPoemDate } from "@/features/posts/formatters";
import { getContentViewer } from "@/server/policies/access";
import {
  countVisibleComments,
  listCommentRoots,
} from "@/server/services/comments";
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
  const viewer = await getContentViewer();
  const result = await getPublishedPoemAccess(parsedId.data, viewer.scope);
  return { title: result.kind === "visible" ? result.poem.title : "诗作" };
}

export default async function PoemDetailPage({ params }: PoemDetailPageProps) {
  const { id } = await params;
  const parsedId = poemIdSchema.safeParse(id);
  if (!parsedId.success) {
    notFound();
  }

  const viewer = await getContentViewer();
  const result = await getPublishedPoemAccess(parsedId.data, viewer.scope);
  if (result.kind === "not_found") {
    notFound();
  }

  if (result.kind === "login_required") {
    return (
      <PageContainer width="reading">
        <div
          aria-hidden="true"
          className="pointer-events-none blur-sm select-none"
        >
          <PageHeader
            eyebrow="诗作"
            title="成员作品"
            description="登录后继续阅读"
          />
          <div className="mt-6 h-20 rounded-lg border border-border-subtle bg-surface-muted" />
          <article className="mt-8 space-y-4 border-y border-border bg-paper px-4 py-10 shadow-card sm:px-6 md:py-8 lg:px-8">
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
  const [commentPage, commentCount] = await Promise.all([
    listCommentRoots(parsedId.data, viewer),
    countVisibleComments(parsedId.data),
  ]);

  return (
    <PageContainer width="reading">
      <PageHeader
        eyebrow="诗作"
        title={poem.title}
        description={`作者：${poem.authorName}`}
      />

      <dl className="mt-6 border-y border-border-subtle py-3 text-label sm:flex sm:flex-wrap sm:gap-x-8">
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

      <PoemReading aria-label={poem.title}>{poem.body}</PoemReading>

      {poem.context ? (
        <ReadingContext
          aria-labelledby="poem-context-title"
          className="mt-8"
          titleId="poem-context-title"
        >
          {poem.context}
        </ReadingContext>
      ) : null}

      <CommentSection
        poemId={poem.id}
        initialPage={commentPage}
        commentCount={commentCount}
        canWrite={viewer.status === "active"}
        isAuthenticated={viewer.userId !== null}
        rootCreationToken={randomUUID()}
      />
    </PageContainer>
  );
}
