"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CommentCard } from "./comment-card";
import { CommentForm } from "./comment-form";
import { useCommentPagination } from "@/features/comments/use-comment-pagination";
import type { CommentDto, CommentRootDto, CursorPage } from "@/server/services/comments/types";
export { CommentCard } from "./comment-card";

function CommentRootList({
  poemId,
  initialPage,
  revision,
}: Readonly<{
  poemId: string;
  initialPage: CursorPage<CommentRootDto>;
  revision: string;
}>) {
  const { items, nextCursor, loading, error, loadMore } = useCommentPagination(
    `/api/poems/${encodeURIComponent(poemId)}/comments`, initialPage, revision, "append",
  );
  const loadError = error ? "更多评论暂时无法加载，请重试。" : null;

  return (
    <>
      <div className="mt-8 space-y-5">
        {items.length === 0 ? (
          <p className="py-6 text-center text-subtle">还没有评论。</p>
        ) : items.map((root) => (
          <div key={root.id} className="space-y-3">
            <CommentCard comment={root} />
            {root.replies.map((reply) => <CommentCard key={reply.id} comment={reply} />)}
            <div className="flex justify-end">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/poems/${poemId}/comments/${root.id}`}>
                  {root.replyCount > root.replies.length
                    ? `查看全部 ${root.replyCount} 条回复`
                    : "查看完整讨论"}
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
      {loadError ? (
        <Alert variant="danger" role="alert" className="mt-4">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : null}
      {nextCursor ? (
        <div className="mt-6 flex justify-center">
          <Button type="button" variant="secondary" loading={loading} onClick={loadMore}>
            {loading ? "正在加载…" : "加载更多评论"}
          </Button>
        </div>
      ) : null}
    </>
  );
}

export function CommentSection({
  poemId,
  initialPage,
  commentCount,
  canWrite,
  isAuthenticated,
  rootCreationToken,
  loginNextPath,
}: Readonly<{
  poemId: string;
  initialPage: CursorPage<CommentRootDto>;
  commentCount: number;
  canWrite: boolean;
  isAuthenticated: boolean;
  rootCreationToken: string;
  loginNextPath?: string;
}>) {
  return (
    <section aria-labelledby="comments-title" className="mt-14 border-t border-border-subtle pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="comments-title" className="font-serif text-section-title text-foreground">
          评论与补充
        </h2>
        <span className="text-label text-subtle">{commentCount} 条可见评论</span>
      </div>
      <div className="mt-5">
        {canWrite ? (
          <CommentForm
            poemId={poemId}
            parentId={null}
            initialCreationToken={rootCreationToken}
          />
        ) : isAuthenticated ? (
          <Alert>
            <AlertDescription>当前账号处于只读状态，不能发布或修改评论。</AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertDescription>
              登录后可以参与讨论。<Link className="ml-1 underline" href={`/login?next=${encodeURIComponent(loginNextPath ?? `/poems/${poemId}`)}`}>前往登录</Link>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <CommentRootList key={poemId} poemId={poemId} initialPage={initialPage} revision={rootCreationToken} />
    </section>
  );
}

export function CommentThread({
  poemId,
  root,
  initialReplies,
  initialCursor,
  focusId,
  revision,
}: Readonly<{
  poemId: string;
  root: CommentDto;
  initialReplies: ReadonlyArray<CommentDto>;
  initialCursor: string | null;
  focusId: string | null;
  revision: string;
}>) {
  const { items: replies, nextCursor: cursor, loading, error: failed, loadMore: loadEarlier } = useCommentPagination(
    `/api/poems/${encodeURIComponent(poemId)}/comments/${encodeURIComponent(root.id)}/replies`,
    { items: initialReplies, nextCursor: initialCursor }, revision, "prepend",
  );
  const error = failed ? "更早的回复暂时无法加载，请重试。" : null;

  useEffect(() => {
    if (!focusId) return;
    const element = document.getElementById(`comment-${focusId}`);
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    element?.scrollIntoView({
      block: "center",
      behavior: reducedMotion ? "auto" : "smooth",
    });
    element?.focus({ preventScroll: true });
  }, [focusId]);

  return (
    <div className="space-y-4">
      <CommentCard comment={root} focused={focusId === root.id} />
      {cursor ? (
        <div className="flex justify-center">
          <Button type="button" variant="secondary" loading={loading} onClick={loadEarlier}>
            {loading ? "正在加载…" : "加载更早回复"}
          </Button>
        </div>
      ) : null}
      {error ? (
        <Alert variant="danger" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {replies.map((reply) => (
        <CommentCard key={reply.id} comment={reply} focused={focusId === reply.id} />
      ))}
    </div>
  );
}
