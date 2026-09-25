"use client";

import { useActionState } from "react";
import Link from "next/link";

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
  deleteCollectionAction,
  publishCollectionAction,
  withdrawCollectionAction,
  type CollectionActionState,
} from "@/features/collections/actions";
import { guardUnsavedFormSubmission } from "@/lib/use-unsaved-form-guard";

const INITIAL_STATE: CollectionActionState = { status: "idle" };

function ActionMessage({ state }: Readonly<{ state: CollectionActionState }>) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <Alert variant={state.status === "error" ? "danger" : "success"} role="status">
      <AlertDescription>{state.message}</AlertDescription>
    </Alert>
  );
}

export function CollectionActions({
  id,
  status,
  publishedAt,
  moderationStatus,
  availableItemCount,
  compact = false,
  showPublish = true,
}: Readonly<{
  id: string;
  status: "draft" | "published";
  publishedAt: Date | null;
  moderationStatus: "visible" | "hidden";
  availableItemCount: number;
  compact?: boolean;
  showPublish?: boolean;
}>) {
  const [publishState, publishAction, publishPending] = useActionState(
    publishCollectionAction.bind(null, id),
    INITIAL_STATE,
  );
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(
    withdrawCollectionAction.bind(null, id),
    INITIAL_STATE,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCollectionAction.bind(null, id),
    INITIAL_STATE,
  );
  const hidden = moderationStatus === "hidden";
  const canPublish = availableItemCount > 0;
  const buttonSize = compact ? "sm" : "default";

  return (
    <div className={compact ? "min-w-0" : "space-y-3"}>
      <div className="flex w-full flex-wrap items-center gap-2">
        {status === "draft" ? (
          <>
            {showPublish ? <form action={publishAction} onSubmit={guardUnsavedFormSubmission}>
              <Button
                type="submit"
                size={buttonSize}
                loading={publishPending}
              >
                {publishPending ? "正在发布…" : compact ? "发布" : "发布特辑"}
              </Button>
            </form> : null}
            {publishedAt === null ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="danger" size={buttonSize}>
                    删除草稿
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>删除未发布特辑草稿？</AlertDialogTitle>
                    <AlertDialogDescription>
                      特辑信息与收录顺序会一并删除，操作无法恢复。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <ActionMessage state={deleteState} />
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <form action={deleteAction} onSubmit={guardUnsavedFormSubmission}>
                      <Button
                        type="submit"
                        variant="danger"
                        size={buttonSize}
                        loading={deletePending}
                      >
                        {deletePending ? "正在删除…" : "确认删除"}
                      </Button>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </>
        ) : (
          <>
            {!hidden ? (
              <Button asChild variant="secondary" size={buttonSize}>
                <Link href={`/collections/${id}`}>查看特辑</Link>
              </Button>
            ) : null}
            <form action={withdrawAction} onSubmit={guardUnsavedFormSubmission}>
              <Button
                type="submit"
                variant="danger"
                size={buttonSize}
                loading={withdrawPending}
              >
                {withdrawPending ? "正在撤回…" : "撤回特辑"}
              </Button>
            </form>
          </>
        )}
      </div>
      {status === "draft" && !canPublish ? (
        compact ? (
          <p className="text-caption text-subtle">先收录至少一篇当前可读的诗作。</p>
        ) : (
          <Alert variant="warning">
            <AlertDescription>
              发布前需要先收录至少一篇当前可读、且符合特辑访问范围的已发布诗作。
            </AlertDescription>
          </Alert>
        )
      ) : null}
      {hidden ? (
        <Alert variant="warning">
          <AlertDescription>
            该特辑已被管理员隐藏，保存、撤回或重新发布都不会解除隐藏。
          </AlertDescription>
        </Alert>
      ) : null}
      <ActionMessage state={status === "draft" ? publishState : withdrawState} />
    </div>
  );
}
