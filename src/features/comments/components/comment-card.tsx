"use client";

import { CommentForm } from "./comment-form";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

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
  deleteCommentAction,
  updateCommentAction,
  type CommentActionState,
} from "@/features/comments/actions";
import type { CommentDto } from "@/server/services/comments/types";
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

