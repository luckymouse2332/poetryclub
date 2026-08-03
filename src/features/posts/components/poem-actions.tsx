"use client";

import { useActionState } from "react";
import Link from "next/link";

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
  deletePoemAction,
  publishPoemAction,
  withdrawPoemAction,
} from "@/features/posts/actions";
import type { PoemActionState } from "@/features/posts/actions";

type PoemActionsProps = Readonly<{
  id: string;
  status: "draft" | "published";
  /**
   * 管理状态：hidden 时不显示“查看公开页”，但发布 / 撤回 / 删除仍可操作
   * （服务端不会清除隐藏状态）。
   */
  moderationStatus?: "visible" | "hidden";
  /**
   * 紧凑布局：嵌入我的诗作卡片等场景时使用。按钮切换为 sm 尺寸（仍保持
   * 44px 最低交互高度），内部按钮改为横向换行排列，避免卡片横向溢出。
   * 不影响 action 协议或安全语义。
   */
  compact?: boolean;
}>;

const INITIAL_STATE: PoemActionState = { status: "idle" };

function ActionError({ state }: Readonly<{ state: PoemActionState }>) {
  if (state.status !== "error" || !state.message) {
    return null;
  }
  return (
    <p
      role="alert"
      aria-live="polite"
      className="rounded-md border border-danger bg-danger-surface p-3 text-label text-danger"
    >
      {state.message}
    </p>
  );
}

/**
 * 状态操作区（Client Component）：草稿可发布 / 删除，已发布可查看公开页 / 撤回。
 * 每个操作独立使用 `useActionState`，提交期间按钮 loading 并禁止重复提交。
 * 删除必须经 AlertDialog 二次确认，且只允许删除未发布草稿。
 * 被管理员隐藏的作品不显示“查看公开页”，其余状态操作保持可用且不解除隐藏。
 */
export function PoemActions({
  id,
  status,
  moderationStatus = "visible",
  compact = false,
}: PoemActionsProps) {
  const [publishState, publishAction, publishPending] = useActionState(
    publishPoemAction.bind(null, id),
    INITIAL_STATE,
  );
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(
    withdrawPoemAction.bind(null, id),
    INITIAL_STATE,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePoemAction.bind(null, id),
    INITIAL_STATE,
  );
  const buttonSize = compact ? "sm" : "default";
  const hidden = moderationStatus === "hidden";

  return (
    <div className="space-y-3">
      <div
        className={
          compact
            ? "flex flex-wrap items-center gap-2"
            : "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
        }
      >
        {status === "draft" ? (
          <>
            <form action={publishAction}>
              <Button
                type="submit"
                variant="primary"
                size={buttonSize}
                loading={publishPending}
              >
                {publishPending ? "正在发布…" : "发布"}
              </Button>
            </form>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="danger" size={buttonSize}>
                  删除草稿
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>删除未发布草稿？</AlertDialogTitle>
                  <AlertDialogDescription>
                    只会删除未发布的草稿，已发布的作品需要先撤回。删除后无法恢复。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <ActionError state={deleteState} />
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <form action={deleteAction}>
                    <Button
                      type="submit"
                      variant="danger"
                      size={buttonSize}
                      loading={deletePending}
                    >
                      {deletePending ? "正在删除…" : "确认删除草稿"}
                    </Button>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <>
            {!hidden ? (
              <Button asChild variant="secondary" size={buttonSize}>
                <Link href={`/poems/${id}`}>查看公开页</Link>
              </Button>
            ) : null}
            <form action={withdrawAction}>
              <Button
                type="submit"
                variant="danger"
                size={buttonSize}
                loading={withdrawPending}
              >
                {withdrawPending ? "正在撤回…" : "撤回"}
              </Button>
            </form>
          </>
        )}
      </div>
      {hidden ? (
        <p className="rounded-md border border-warning/30 bg-warning-surface p-3 text-label text-warning">
          该作品已被管理员隐藏，不会对所有人可见；保存、撤回或重新发布都不会解除隐藏。
        </p>
      ) : null}
      {status === "draft" ? (
        <ActionError state={publishState} />
      ) : (
        <ActionError state={withdrawState} />
      )}
    </div>
  );
}
