"use server";

import { revalidatePath } from "next/cache";

import { getCommentErrorMessage } from "@/features/comments/error-messages";
import {
  AccessControlError,
  requireActiveUser,
} from "@/server/policies/access";
import {
  CommentError,
  createComment,
  deleteOwnComment,
  updateOwnComment,
} from "@/server/services/comments";
import {
  createCommentInputSchema,
  deleteCommentInputSchema,
  updateCommentInputSchema,
} from "@/server/validation/comments";

export type CommentActionState = Readonly<{
  status: "idle" | "success" | "error";
  message?: string;
  fieldError?: string;
  revision?: number;
}>;

function accessError(error: unknown): CommentActionState | null {
  if (!(error instanceof AccessControlError)) return null;
  return {
    status: "error",
    message:
      error.code === "account_suspended"
        ? "当前账号只能阅读内容，不能发布或修改评论。"
        : "请重新登录后再操作。",
  };
}

function commentError(error: unknown): CommentActionState | null {
  if (!(error instanceof CommentError)) return null;
  return { status: "error", message: getCommentErrorMessage(error.code) };
}

function revalidateCommentViews(poemId: string, rootId?: string): void {
  revalidatePath("/poems");
  revalidatePath(`/poems/${poemId}`);
  if (rootId) revalidatePath(`/poems/${poemId}/comments/${rootId}`);
  revalidatePath("/admin/comments");
  revalidatePath("/admin/audit");
  revalidatePath("/notifications");
}

async function runCommentMutation(
  mutation: () => Promise<void>,
  successMessage: string,
): Promise<CommentActionState> {
  try {
    await mutation();
    return { status: "success", message: successMessage };
  } catch (error) {
    const known = commentError(error) ?? accessError(error);
    if (known) return known;
    console.error("Unexpected comment mutation failure");
    return { status: "error", message: "操作暂时失败，请稍后重试。" };
  }
}

export async function createCommentAction(
  poemId: string,
  parentId: string | null,
  previousState: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  let currentUser;
  try {
    currentUser = await requireActiveUser(`/poems/${poemId}`);
  } catch (error) {
    const known = accessError(error);
    if (known) return known;
    throw error;
  }
  const parsed = createCommentInputSchema.safeParse({
    poemId,
    parentId,
    body: formData.get("body"),
    creationToken: formData.get("creationToken"),
  });
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: "请检查评论内容。",
      fieldError: fields.body?.[0] ?? fields.creationToken?.[0],
      revision: (previousState.revision ?? 0) + 1,
    };
  }
  try {
    const id = await createComment(currentUser.id, parsed.data);
    revalidateCommentViews(poemId, parentId ?? id);
    return { status: "success", message: parentId ? "回复已发布。" : "评论已发布。" };
  } catch (error) {
    const known = commentError(error);
    if (known) return known;
    console.error("Unexpected comment creation failure");
    return { status: "error", message: "评论暂时无法发布，请稍后重试。" };
  }
}

export async function updateCommentAction(
  poemId: string,
  commentId: string,
  _previousState: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  void _previousState;
  let currentUser;
  try {
    currentUser = await requireActiveUser(`/poems/${poemId}`);
  } catch (error) {
    const known = accessError(error);
    if (known) return known;
    throw error;
  }
  const parsed = updateCommentInputSchema.safeParse({
    poemId,
    commentId,
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查评论内容。",
      fieldError: parsed.error.flatten().fieldErrors.body?.[0],
    };
  }
  return runCommentMutation(async () => {
    await updateOwnComment(
      currentUser.id,
      parsed.data.poemId,
      parsed.data.commentId,
      parsed.data.body,
    );
    revalidateCommentViews(poemId);
  }, "评论已更新。");
}

export async function deleteCommentAction(
  poemId: string,
  commentId: string,
  _previousState: CommentActionState,
  _formData: FormData,
): Promise<CommentActionState> {
  void _previousState;
  void _formData;
  let currentUser;
  try {
    currentUser = await requireActiveUser(`/poems/${poemId}`);
  } catch (error) {
    const known = accessError(error);
    if (known) return known;
    throw error;
  }
  const parsed = deleteCommentInputSchema.safeParse({ poemId, commentId });
  if (!parsed.success) {
    return { status: "error", message: "评论编号无效。" };
  }
  return runCommentMutation(async () => {
    await deleteOwnComment(
      currentUser.id,
      parsed.data.poemId,
      parsed.data.commentId,
    );
    revalidateCommentViews(poemId);
  }, "评论已删除，回复结构仍会保留。" );
}
