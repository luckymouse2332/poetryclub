"use server";

import { revalidatePath } from "next/cache";

import {
  AccessControlError,
  requireAdmin,
  type AuthoritativeUser,
} from "@/server/policies/access";
import {
  ModerationMutationError,
  createInvitation,
  disableInvitation,
  hidePoem,
  restorePoem,
  setUserRole,
  setUserSuspended,
} from "@/server/services/moderation";
import {
  createInvitationInputSchema,
  disableInvitationInputSchema,
  hidePoemInputSchema,
  restorePoemInputSchema,
  restoreUserInputSchema,
  suspendUserInputSchema,
  updateUserRoleInputSchema,
} from "@/server/validation/moderation";

// "use server" 文件只能导出 async 函数，因此 AdminActionState 与
// INITIAL_ADMIN_ACTION_STATE 定义在 action-state.ts，这里只 re-export 类型。
import type { AdminActionState } from "@/features/moderation/action-state";

export type { AdminActionState } from "@/features/moderation/action-state";

function accessError(error: unknown): AdminActionState | null {
  if (!(error instanceof AccessControlError)) return null;
  return {
    status: "error",
    message:
      error.code === "account_suspended"
        ? "当前账号已被禁用，不能执行管理操作。"
        : "你没有执行此管理操作的权限。",
  };
}

function mutationError(error: unknown): AdminActionState | null {
  if (!(error instanceof ModerationMutationError)) return null;
  const messages = {
    not_found: "目标不存在。",
    invalid_transition: "当前状态不允许此操作。",
    self_operation: "不能对自己的管理员身份执行此操作。",
    last_active_admin: "操作被拒绝：系统必须保留至少一名正常管理员。",
    concurrent_conflict: "目标已被其他操作修改，请刷新后重试。",
  } as const;
  return { status: "error", message: messages[error.code] };
}

async function authorize(): Promise<AuthoritativeUser | AdminActionState> {
  try {
    return await requireAdmin("/admin");
  } catch (error) {
    const state = accessError(error);
    if (state) return state;
    throw error;
  }
}

function isActionState(
  value: AuthoritativeUser | AdminActionState,
): value is AdminActionState {
  return "message" in value || "fieldErrors" in value || value.status === "idle";
}

function firstFieldErrors(
  errors: Record<string, string[] | undefined>,
): Readonly<Record<string, string | undefined>> {
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [key, messages?.[0]]),
  );
}

function revalidatePoemModeration(id: string): void {
  revalidatePath("/", "layout");
  revalidatePath("/poems");
  revalidatePath(`/poems/${id}`);
  revalidatePath("/account/poems");
  revalidatePath(`/account/poems/${id}/edit`);
  revalidatePath("/admin/poems");
  revalidatePath("/admin/audit");
  revalidatePath("/notifications");
}

function revalidateUserModeration(): void {
  revalidatePath("/", "layout");
  revalidatePath("/notifications");
  revalidatePath("/admin/users");
  revalidatePath("/admin/audit");
}

async function runMutation(
  mutation: () => Promise<void>,
  successMessage: string,
): Promise<AdminActionState> {
  try {
    await mutation();
    return { status: "success", message: successMessage };
  } catch (error) {
    const state = mutationError(error);
    if (state) return state;
    console.error("Unexpected administrator mutation failure", error);
    return { status: "error", message: "操作暂时失败，请稍后重试。" };
  }
}

export async function hidePoemAction(
  targetId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await authorize();
  if (isActionState(admin)) return admin;
  const parsed = hidePoemInputSchema.safeParse({
    targetId,
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查隐藏原因。",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  return runMutation(async () => {
    await hidePoem(admin.id, parsed.data.targetId, parsed.data.reason);
    revalidatePoemModeration(parsed.data.targetId);
  }, "诗作已隐藏。");
}

export async function restorePoemAction(
  targetId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await authorize();
  if (isActionState(admin)) return admin;
  const parsed = restorePoemInputSchema.safeParse({
    targetId,
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "请填写恢复说明。",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  return runMutation(async () => {
    await restorePoem(admin.id, parsed.data.targetId, parsed.data.reason);
    revalidatePoemModeration(parsed.data.targetId);
  }, "诗作已恢复。");
}

export async function suspendUserAction(
  targetId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await authorize();
  if (isActionState(admin)) return admin;
  const parsed = suspendUserInputSchema.safeParse({
    targetId,
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "请填写禁用原因。",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  return runMutation(async () => {
    await setUserSuspended(admin.id, parsed.data.targetId, parsed.data.reason, true);
    revalidateUserModeration();
  }, "用户已禁用。");
}

export async function restoreUserAction(
  targetId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await authorize();
  if (isActionState(admin)) return admin;
  const parsed = restoreUserInputSchema.safeParse({
    targetId,
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "请填写恢复原因。",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  return runMutation(async () => {
    await setUserSuspended(admin.id, parsed.data.targetId, parsed.data.reason, false);
    revalidateUserModeration();
  }, "用户已恢复。");
}

export async function updateUserRoleAction(
  targetId: string,
  newRole: "member" | "admin",
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await authorize();
  if (isActionState(admin)) return admin;
  const parsed = updateUserRoleInputSchema.safeParse({
    targetId,
    newRole,
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "请填写角色变更原因。",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  return runMutation(async () => {
    await setUserRole(
      admin.id,
      parsed.data.targetId,
      parsed.data.reason,
      parsed.data.newRole,
    );
    revalidateUserModeration();
  }, newRole === "admin" ? "用户已提升为管理员。" : "管理员已降级为成员。");
}

export async function createInvitationAction(
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await authorize();
  if (isActionState(admin)) return admin;
  const parsed = createInvitationInputSchema().safeParse({
    maxUses: formData.get("maxUses"),
    expiresAt: formData.get("expiresAt"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "请检查邀请码设置。",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  try {
    const created = await createInvitation(admin.id, parsed.data);
    revalidatePath("/admin/invitations");
    revalidatePath("/admin/audit");
    return {
      status: "success",
      message: "邀请码已创建。请立即复制，关闭后将无法再次查看。",
      invitationCode: created.code,
    };
  } catch (error) {
    console.error("Unexpected invitation creation failure", error);
    return { status: "error", message: "邀请码创建失败，请稍后重试。" };
  }
}

export async function disableInvitationAction(
  targetId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await authorize();
  if (isActionState(admin)) return admin;
  const parsed = disableInvitationInputSchema.safeParse({
    targetId,
    reason: formData.get("reason"),
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: "请填写停用原因。",
      fieldErrors: firstFieldErrors(parsed.error.flatten().fieldErrors),
    };
  }
  return runMutation(async () => {
    await disableInvitation(admin.id, parsed.data.targetId, parsed.data.reason);
    revalidatePath("/admin/invitations");
    revalidatePath("/admin/audit");
  }, "邀请码已停用。");
}
