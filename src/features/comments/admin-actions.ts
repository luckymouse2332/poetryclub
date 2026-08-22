"use server";

import { revalidatePath } from "next/cache";

import type { AdminActionState } from "@/features/moderation/action-state";
import {
  AccessControlError,
  requireAdmin,
} from "@/server/policies/access";
import {
  CommentError,
  hideComment,
  restoreComment,
} from "@/server/services/comments";
import { moderateCommentInputSchema } from "@/server/validation/comments";

async function moderateCommentAction(
  targetId: string,
  hidden: boolean,
  formData: FormData,
): Promise<AdminActionState> {
  let admin;
  try {
    admin = await requireAdmin("/admin/comments");
  } catch (error) {
    if (error instanceof AccessControlError) {
      return { status: "error", message: "你没有执行此管理操作的权限。" };
    }
    throw error;
  }
  const parsed = moderateCommentInputSchema.safeParse({
    targetId,
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: hidden ? "请填写隐藏原因。" : "请填写恢复说明。",
      fieldErrors: {
        reason: parsed.error.flatten().fieldErrors.reason?.[0],
      },
    };
  }
  try {
    if (hidden) {
      await hideComment(admin.id, parsed.data.targetId, parsed.data.reason);
    } else {
      await restoreComment(admin.id, parsed.data.targetId, parsed.data.reason);
    }
    revalidatePath("/admin/comments");
    revalidatePath("/admin/audit");
    revalidatePath("/poems");
    revalidatePath("/poems", "layout");
    revalidatePath("/notifications");
    return {
      status: "success",
      message: hidden ? "评论已隐藏。" : "评论已恢复。",
    };
  } catch (error) {
    if (error instanceof CommentError) {
      return {
        status: "error",
        message:
          error.code === "not_found"
            ? "评论不存在。"
            : "评论状态已变化，请刷新后重试。",
      };
    }
    console.error("Unexpected comment moderation failure");
    return { status: "error", message: "操作暂时失败，请稍后重试。" };
  }
}

export async function hideCommentAction(
  targetId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return moderateCommentAction(targetId, true, formData);
}

export async function restoreCommentAction(
  targetId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return moderateCommentAction(targetId, false, formData);
}
