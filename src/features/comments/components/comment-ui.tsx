"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
  type CommentActionState,
} from "@/features/comments/actions";
import type {
  CommentDto,
  CommentRootDto,
  CursorPage,
} from "@/server/services/comments";
import { COMMENT_BODY_MAX_LENGTH } from "@/server/validation/comments";

const INITIAL_STATE: CommentActionState = { status: "idle" };

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatCommentTime(value: string): string {
  return dateTimeFormatter.format(new Date(value));
}

function CommentForm({
  poemId,
  parentId,
  initialCreationToken,
  onSuccess,
}: Readonly<{
  poemId: string;
  parentId: string | null;
  initialCreationToken?: string;
  onSuccess?: () => void;
}>) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const tokenRef = useRef<HTMLInputElement>(null);
  const action = createCommentAction.bind(null, poemId, parentId);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);

  useEffect(() => {
    if (state.status !== "success") return;
    formRef.current?.reset();
    if (tokenRef.current) tokenRef.current.value = crypto.randomUUID();
    router.refresh();
    onSuccess?.();
  }, [state.status, router, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input
        ref={tokenRef}
        type="hidden"
        name="creationToken"
        defaultValue={initialCreationToken ?? crypto.randomUUID()}
      />
      {state.message ? (
        <Alert
          variant={state.status === "success" ? "success" : "danger"}
          role="status"
        >
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <FormField
        id={`comment-body-${parentId ?? "root"}`}
        label={parentId ? "回复内容" : "评论内容"}
        required
        disabled={pending}
        error={state.fieldError}
        description="纯文本，最多 2000 个字符。"
      >
        {(controlProps) => (
          <Textarea
            {...controlProps}
            name="body"
            rows={parentId ? 4 : 5}
            maxLength={COMMENT_BODY_MAX_LENGTH}
            placeholder={parentId ? "写下你的回复" : "写下与作品有关的评论或补充"}
          />
        )}
      </FormField>
      <Button type="submit" loading={pending}>
        {pending ? "正在发布…" : parentId ? "发布回复" : "发布评论"}
      </Button>
    </form>
  );
}

function CommentEditor({ comment }: Readonly<{ comment: CommentDto }>) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost">编辑</Button>
      </DialogTrigger>
      {open ? (
        <CommentEditorContent comment={comment} onClose={() => setOpen(false)} />
      ) : null}
    </Dialog>
  );
}

function CommentEditorContent({
  comment,
  onClose,
}: Readonly<{ comment: CommentDto; onClose: () => void }>) {
  const router = useRouter();
  const action = updateCommentAction.bind(null, comment.poemId, comment.id);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  useEffect(() => {
    if (state.status === "success") {
      onClose();
      router.refresh();
    }
  }, [state.status, router, onClose]);
  return (
    <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑评论</DialogTitle>
          <DialogDescription>保存后只显示最新版本，并标记为已编辑。</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          {state.status === "error" && state.message ? (
            <Alert variant="danger" role="alert">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          ) : null}
          <FormField
            id={`edit-comment-${comment.id}`}
            label="评论内容"
            required
            disabled={pending}
            error={state.fieldError}
          >
            {(controlProps) => (
              <Textarea
                {...controlProps}
                name="body"
                rows={6}
                maxLength={COMMENT_BODY_MAX_LENGTH}
                defaultValue={comment.body ?? ""}
              />
            )}
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" loading={pending}>
              {pending ? "正在保存…" : "保存修改"}
            </Button>
          </DialogFooter>
        </form>
    </DialogContent>
  );
}

function CommentDelete({ comment }: Readonly<{ comment: CommentDto }>) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost">删除</Button>
      </AlertDialogTrigger>
      {open ? (
        <CommentDeleteContent comment={comment} onClose={() => setOpen(false)} />
      ) : null}
    </AlertDialog>
  );
}

function CommentDeleteContent({
  comment,
  onClose,
}: Readonly<{ comment: CommentDto; onClose: () => void }>) {
  const router = useRouter();
  const action = deleteCommentAction.bind(null, comment.poemId, comment.id);
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE);
  useEffect(() => {
    if (state.status === "success") {
      onClose();
      router.refresh();
    }
  }, [state.status, router, onClose]);
  return (
    <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除这条评论？</AlertDialogTitle>
          <AlertDialogDescription>
            正文会被清空且不能恢复。已有回复会继续显示，结构占位会保留。
          </AlertDialogDescription>
        </AlertDialogHeader>
        {state.status === "error" && state.message ? (
          <Alert variant="danger" role="alert">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        ) : null}
        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <Button type="submit" variant="danger" loading={pending}>
              {pending ? "正在删除…" : "确认删除"}
            </Button>
          </AlertDialogFooter>
        </form>
    </AlertDialogContent>
  );
}

function CommentReply({ comment }: Readonly<{ comment: CommentDto }>) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="ghost">回复</Button>
      </DialogTrigger>
      {open ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>回复 {comment.authorName}</DialogTitle>
            <DialogDescription>当前版本支持一级回复。</DialogDescription>
          </DialogHeader>
          <CommentForm
            poemId={comment.poemId}
            parentId={comment.id}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

export function CommentCard({
  comment,
  focused = false,
}: Readonly<{ comment: CommentDto; focused?: boolean }>) {
  return (
    <article
      id={`comment-${comment.id}`}
      tabIndex={focused ? -1 : undefined}
      className={`rounded-lg border p-4 outline-none transition-colors ${
        focused
          ? "border-seal-foreground bg-seal-surface"
          : "border-border-subtle bg-paper"
      } ${comment.depth > 0 ? "ml-4 sm:ml-8" : ""}`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2 text-label">
        <span className="font-medium text-foreground">{comment.authorName}</span>
        <span className="text-subtle">
          <time dateTime={comment.createdAt}>{formatCommentTime(comment.createdAt)}</time>
          {comment.editedAt ? " · 已编辑" : null}
        </span>
      </header>
      {comment.placeholder === "deleted" ? (
        <p className="mt-3 italic text-subtle">这条评论已由作者删除。</p>
      ) : comment.placeholder === "hidden" ? (
        <p className="mt-3 italic text-subtle">这条评论已被管理员隐藏。</p>
      ) : (
        <p className="mt-3 whitespace-pre-wrap break-words text-body leading-copy text-foreground">
          {comment.body}
        </p>
      )}
      {comment.moderationReason ? (
        <Alert variant="warning" className="mt-3">
          <AlertDescription>
            该评论仅你可见。管理员处理原因：{comment.moderationReason}
          </AlertDescription>
        </Alert>
      ) : null}
      {comment.canReply || comment.canEdit || comment.canDelete ? (
        <footer className="mt-3 flex flex-wrap gap-1">
          {comment.canReply ? <CommentReply comment={comment} /> : null}
          {comment.canEdit ? <CommentEditor comment={comment} /> : null}
          {comment.canDelete ? <CommentDelete comment={comment} /> : null}
        </footer>
      ) : null}
    </article>
  );
}

function CommentRootList({
  poemId,
  initialPage,
}: Readonly<{
  poemId: string;
  initialPage: CursorPage<CommentRootDto>;
}>) {
  const [items, setItems] = useState(initialPage.items);
  const [nextCursor, setNextCursor] = useState(initialPage.nextCursor);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(
        `/api/poems/${encodeURIComponent(poemId)}/comments?cursor=${encodeURIComponent(nextCursor)}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("request failed");
      const page = (await response.json()) as CursorPage<CommentRootDto>;
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      setLoadError("更多评论暂时无法加载，请重试。" );
    } finally {
      setLoading(false);
    }
  }

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
}: Readonly<{
  poemId: string;
  initialPage: CursorPage<CommentRootDto>;
  commentCount: number;
  canWrite: boolean;
  isAuthenticated: boolean;
  rootCreationToken: string;
}>) {
  const pageKey = initialPage.items
    .flatMap((root) => [root, ...root.replies])
    .map(
      (comment) =>
        `${comment.id}:${comment.editedAt}:${comment.placeholder}:${comment.replyCount}`,
    )
    .join("|");

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
              登录后可以参与讨论。<Link className="ml-1 underline" href={`/login?next=${encodeURIComponent(`/poems/${poemId}`)}`}>前往登录</Link>
            </AlertDescription>
          </Alert>
        )}
      </div>
      <CommentRootList key={pageKey} poemId={poemId} initialPage={initialPage} />
    </section>
  );
}

export function CommentThread({
  poemId,
  root,
  initialReplies,
  initialCursor,
  focusId,
}: Readonly<{
  poemId: string;
  root: CommentDto;
  initialReplies: ReadonlyArray<CommentDto>;
  initialCursor: string | null;
  focusId: string | null;
}>) {
  const [replies, setReplies] = useState(initialReplies);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function loadEarlier() {
    if (!cursor || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/poems/${encodeURIComponent(poemId)}/comments/${encodeURIComponent(root.id)}/replies?cursor=${encodeURIComponent(cursor)}`,
        { cache: "no-store" },
      );
      if (!response.ok) throw new Error("request failed");
      const page = (await response.json()) as CursorPage<CommentDto>;
      setReplies((current) => [...page.items, ...current]);
      setCursor(page.nextCursor);
    } catch {
      setError("更早的回复暂时无法加载，请重试。" );
    } finally {
      setLoading(false);
    }
  }

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
