"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import {
  deleteCollectionAction,
  publishCollectionAction,
  withdrawCollectionAction,
  type CollectionActionState,
} from "@/features/collections/actions";

const INITIAL_STATE: CollectionActionState = { status: "idle" };

export function CollectionListActions({
  id,
  title,
  status,
  publishedAt,
  moderationStatus,
  availableItemCount,
}: Readonly<{
  id: string;
  title: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  moderationStatus: "visible" | "hidden";
  availableItemCount: number;
}>) {
  const [publishState, publishAction, publishPending] = useActionState(publishCollectionAction.bind(null, id), INITIAL_STATE);
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(withdrawCollectionAction.bind(null, id), INITIAL_STATE);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteCollectionAction.bind(null, id), INITIAL_STATE);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pending = publishPending || withdrawPending || deletePending;
  const message = [publishState, withdrawState].find((state) => state.status === "error")?.message;

  return (
    <div className="min-w-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton ref={triggerRef} type="button" variant="ghost" aria-label={`更多操作：${title}`} disabled={pending}>
            <MoreHorizontal aria-hidden="true" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          onCloseAutoFocus={(event) => { if (deleteOpen) event.preventDefault(); }}
        >
          {status === "published" ? (
            <>
              {moderationStatus !== "hidden" ? (
                <DropdownMenuItem asChild>
                  <Link href={`/collections/${id}`}>查看特辑</Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem variant="destructive" onSelect={() => startTransition(() => withdrawAction(new FormData()))}>
                撤回特辑
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem
                disabled={availableItemCount === 0}
                onSelect={() => startTransition(() => publishAction(new FormData()))}
              >
                发布
              </DropdownMenuItem>
              {publishedAt === null ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                    删除草稿
                  </DropdownMenuItem>
                </>
              ) : null}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {message ? <p role="alert" className="mt-2 max-w-64 text-label text-danger">{message}</p> : null}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) requestAnimationFrame(() => triggerRef.current?.focus());
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>删除未发布特辑草稿？</AlertDialogTitle>
            <AlertDialogDescription>特辑信息与收录顺序会一并删除，操作无法恢复。</AlertDialogDescription>
          </AlertDialogHeader>
          {deleteState.status === "error" && deleteState.message ? (
            <p role="alert" className="text-label text-danger">{deleteState.message}</p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <form action={deleteAction}>
              <Button type="submit" variant="danger" size="sm" loading={deletePending}>
                {deletePending ? "正在删除…" : "确认删除"}
              </Button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
