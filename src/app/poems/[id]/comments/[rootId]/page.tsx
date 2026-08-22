import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { CommentThread } from "@/features/comments/components/comment-ui";
import { getContentViewer } from "@/server/policies/access";
import { CommentError, listThreadReplies } from "@/server/services/comments";
import { getPublishedPoemAccess } from "@/server/services/poems";
import {
  commentFocusSchema,
  commentIdSchema,
} from "@/server/validation/comments";
import { poemIdSchema } from "@/server/validation/poems";

export const metadata: Metadata = { title: "评论讨论" };

type CommentThreadPageProps = Readonly<{
  params: Promise<{ id: string; rootId: string }>;
  searchParams: Promise<{ focus?: string | string[] }>;
}>;

export default async function CommentThreadPage({
  params,
  searchParams,
}: CommentThreadPageProps) {
  const [{ id, rootId }, query] = await Promise.all([params, searchParams]);
  const parsedPoemId = poemIdSchema.safeParse(id);
  const parsedRootId = commentIdSchema.safeParse(rootId);
  const parsedFocus = commentFocusSchema.safeParse(
    typeof query.focus === "string" ? query.focus : undefined,
  );
  if (!parsedPoemId.success || !parsedRootId.success || !parsedFocus.success) {
    notFound();
  }

  const viewer = await getContentViewer();
  const poemResult = await getPublishedPoemAccess(
    parsedPoemId.data,
    viewer.scope,
  );
  if (poemResult.kind !== "visible") notFound();

  let thread;
  try {
    thread = await listThreadReplies(
      parsedPoemId.data,
      parsedRootId.data,
      viewer,
      { focusId: parsedFocus.data },
    );
  } catch (error) {
    if (error instanceof CommentError) notFound();
    throw error;
  }

  return (
    <PageContainer width="reading">
      <PageHeader
        eyebrow="评论讨论"
        title={`《${poemResult.poem.title}》`}
        description="回复按时间正序排列。"
      />
      <div className="mt-6">
        <Button asChild variant="ghost">
          <Link href={`/poems/${parsedPoemId.data}#comments-title`}>
            返回作品与评论
          </Link>
        </Button>
      </div>
      <div className="mt-6">
        <CommentThread
          key={[thread.root, ...thread.replies]
            .map((comment) => `${comment.id}:${comment.editedAt}:${comment.placeholder}`)
            .join("|")}
          poemId={parsedPoemId.data}
          root={thread.root}
          initialReplies={thread.replies}
          initialCursor={thread.nextCursor}
          focusId={thread.focusId}
        />
      </div>
    </PageContainer>
  );
}
