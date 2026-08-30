"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AdminActionState } from "@/features/moderation/action-state";
import {
  AccessControlError,
  requireActiveUser,
  requireAdmin,
  type AuthoritativeUser,
} from "@/server/policies/access";
import {
  addPoemToCollection,
  CollectionModerationError,
  CollectionMutationError,
  createCollectionDraft,
  deleteOwnCollectionDraft,
  movePoemInCollection,
  publishOwnCollection,
  removePoemFromCollection,
  setCollectionHidden,
  updateOwnCollection,
  withdrawOwnCollection,
} from "@/server/services/collections";
import {
  collectionCreationTokenSchema,
  collectionIdSchema,
  collectionInputSchema,
  collectionItemInputSchema,
  collectionMoveInputSchema,
} from "@/server/validation/collections";
import {
  hideCollectionInputSchema,
  restoreCollectionInputSchema,
} from "@/server/validation/moderation";

export type CollectionActionState = Readonly<{
  status: "idle" | "error" | "success";
  message?: string;
  revision?: number;
  values?: Readonly<{
    title: string;
    description: string;
    visibility: string;
  }>;
  fieldErrors?: Readonly<{
    title?: string;
    description?: string;
    visibility?: string;
  }>;
}>;

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readValues(formData: FormData) {
  return {
    title: readString(formData, "title"),
    description: readString(formData, "description"),
    visibility: readString(formData, "visibility"),
  };
}

function validationState(
  previous: CollectionActionState,
  result: Exclude<
    ReturnType<typeof collectionInputSchema.safeParse>,
    { success: true }
  >,
  values: NonNullable<CollectionActionState["values"]>,
): CollectionActionState {
  const fields = result.error.flatten().fieldErrors;
  return {
    status: "error",
    message: "请检查特辑内容。",
    revision: (previous.revision ?? 0) + 1,
    values,
    fieldErrors: {
      title: fields.title?.[0],
      description: fields.description?.[0],
      visibility: fields.visibility?.[0],
    },
  };
}

function suspendedState(): CollectionActionState {
  return {
    status: "error",
    message: "你的账号已被禁用，目前只能查看公开内容，不能修改特辑。",
  };
}

async function requireCollectionWriter(
  returnTo: string,
): Promise<AuthoritativeUser | CollectionActionState> {
  try {
    return await requireActiveUser(returnTo);
  } catch (error) {
    if (
      error instanceof AccessControlError &&
      error.code === "account_suspended"
    ) {
      return suspendedState();
    }
    throw error;
  }
}

function isActionState(
  value: AuthoritativeUser | CollectionActionState,
): value is CollectionActionState {
  return "message" in value || "fieldErrors" in value;
}

function mutationState(error: unknown): CollectionActionState | null {
  if (!(error instanceof CollectionMutationError)) return null;
  const messages = {
    not_found_or_forbidden: "特辑或收录项目不存在，或者你无权操作。",
    invalid_transition: "当前状态不允许执行该操作，请刷新后重试。",
    empty_collection: "至少收录一篇当前可读的诗作后才能发布。",
    poem_unavailable: "该诗作当前不可收录，可能已经撤回或被隐藏。",
    visibility_conflict: "公开特辑只能收录公开诗作，请先调整收录内容或访问范围。",
    already_included: "该诗作已经收录在当前特辑中。",
    concurrent_conflict: "特辑已被其他操作修改，请刷新后重试。",
  } as const;
  return { status: "error", message: messages[error.code] };
}

function revalidateCollection(id: string): void {
  revalidatePath("/collections");
  revalidatePath(`/collections/${id}`);
  revalidatePath(`/collections/${id}`, "layout");
  revalidatePath("/account/collections");
  revalidatePath(`/account/collections/${id}/edit`);
  revalidatePath("/admin/collections");
}

export async function createCollectionAction(
  previous: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const currentUser = await requireCollectionWriter("/account/collections/new");
  if (isActionState(currentUser)) return currentUser;
  const values = readValues(formData);
  const input = collectionInputSchema.safeParse(values);
  const token = collectionCreationTokenSchema.safeParse(
    formData.get("creationToken"),
  );
  if (!input.success) return validationState(previous, input, values);
  if (!token.success) {
    return { status: "error", message: token.error.issues[0]?.message, values };
  }
  const id = await createCollectionDraft(currentUser.id, token.data, input.data);
  revalidatePath("/account/collections");
  redirect(`/account/collections/${id}/edit?created=1`);
}

export async function updateCollectionAction(
  id: string,
  previous: CollectionActionState,
  formData: FormData,
): Promise<CollectionActionState> {
  const currentUser = await requireCollectionWriter("/account/collections");
  if (isActionState(currentUser)) return currentUser;
  const parsedId = collectionIdSchema.safeParse(id);
  const values = readValues(formData);
  const input = collectionInputSchema.safeParse(values);
  if (!parsedId.success) return { status: "error", message: "特辑编号无效。" };
  if (!input.success) return validationState(previous, input, values);
  try {
    await updateOwnCollection(parsedId.data, currentUser.id, input.data);
  } catch (error) {
    const state = mutationState(error);
    if (state) return state;
    throw error;
  }
  revalidateCollection(parsedId.data);
  redirect(`/account/collections/${parsedId.data}/edit?saved=1`);
}

async function runItemMutation(
  collectionId: string,
  mutation: (ownerId: string) => Promise<void>,
  successMessage: string,
): Promise<CollectionActionState> {
  const currentUser = await requireCollectionWriter(
    `/account/collections/${collectionId}/edit`,
  );
  if (isActionState(currentUser)) return currentUser;
  try {
    await mutation(currentUser.id);
    revalidateCollection(collectionId);
    return { status: "success", message: successMessage };
  } catch (error) {
    const state = mutationState(error);
    if (state) return state;
    throw error;
  }
}

export async function addCollectionItemAction(
  collectionId: string,
  poemId: string,
  _previous: CollectionActionState,
  _formData: FormData,
): Promise<CollectionActionState> {
  void _previous;
  void _formData;
  const parsed = collectionItemInputSchema.safeParse({ collectionId, poemId });
  if (!parsed.success) return { status: "error", message: "收录项目编号无效。" };
  return runItemMutation(
    parsed.data.collectionId,
    (ownerId) =>
      addPoemToCollection(parsed.data.collectionId, parsed.data.poemId, ownerId),
    "诗作已加入特辑。",
  );
}

export async function removeCollectionItemAction(
  collectionId: string,
  poemId: string,
  _previous: CollectionActionState,
  _formData: FormData,
): Promise<CollectionActionState> {
  void _previous;
  void _formData;
  const parsed = collectionItemInputSchema.safeParse({ collectionId, poemId });
  if (!parsed.success) return { status: "error", message: "收录项目编号无效。" };
  return runItemMutation(
    parsed.data.collectionId,
    (ownerId) =>
      removePoemFromCollection(parsed.data.collectionId, parsed.data.poemId, ownerId),
    "诗作已移出特辑。",
  );
}

export async function moveCollectionItemAction(
  collectionId: string,
  poemId: string,
  direction: "up" | "down",
  _previous: CollectionActionState,
  _formData: FormData,
): Promise<CollectionActionState> {
  void _previous;
  void _formData;
  const parsed = collectionMoveInputSchema.safeParse({
    collectionId,
    poemId,
    direction,
  });
  if (!parsed.success) return { status: "error", message: "排序操作无效。" };
  return runItemMutation(
    parsed.data.collectionId,
    (ownerId) =>
      movePoemInCollection(
        parsed.data.collectionId,
        parsed.data.poemId,
        ownerId,
        parsed.data.direction,
      ),
    "特辑顺序已更新。",
  );
}

export async function publishCollectionAction(
  id: string,
  _previous: CollectionActionState,
  _formData: FormData,
): Promise<CollectionActionState> {
  void _previous;
  void _formData;
  const currentUser = await requireCollectionWriter("/account/collections");
  if (isActionState(currentUser)) return currentUser;
  const parsed = collectionIdSchema.safeParse(id);
  if (!parsed.success) return { status: "error", message: "特辑编号无效。" };
  try {
    const result = await publishOwnCollection(parsed.data, currentUser.id);
    revalidateCollection(parsed.data);
    if (result.moderationStatus === "hidden") {
      redirect(`/account/collections/${parsed.data}/edit?published=1`);
    }
  } catch (error) {
    const state = mutationState(error);
    if (state) return state;
    throw error;
  }
  redirect(`/collections/${parsed.data}`);
}

export async function withdrawCollectionAction(
  id: string,
  _previous: CollectionActionState,
  _formData: FormData,
): Promise<CollectionActionState> {
  void _previous;
  void _formData;
  const currentUser = await requireCollectionWriter("/account/collections");
  if (isActionState(currentUser)) return currentUser;
  const parsed = collectionIdSchema.safeParse(id);
  if (!parsed.success) return { status: "error", message: "特辑编号无效。" };
  try {
    await withdrawOwnCollection(parsed.data, currentUser.id);
  } catch (error) {
    const state = mutationState(error);
    if (state) return state;
    throw error;
  }
  revalidateCollection(parsed.data);
  redirect(`/account/collections/${parsed.data}/edit?withdrawn=1`);
}

export async function deleteCollectionAction(
  id: string,
  _previous: CollectionActionState,
  _formData: FormData,
): Promise<CollectionActionState> {
  void _previous;
  void _formData;
  const currentUser = await requireCollectionWriter("/account/collections");
  if (isActionState(currentUser)) return currentUser;
  const parsed = collectionIdSchema.safeParse(id);
  if (!parsed.success) return { status: "error", message: "特辑编号无效。" };
  try {
    await deleteOwnCollectionDraft(parsed.data, currentUser.id);
  } catch (error) {
    const state = mutationState(error);
    if (state) return state;
    throw error;
  }
  revalidateCollection(parsed.data);
  redirect("/account/collections?deleted=1");
}

function moderationValidationState(
  result: { error: { flatten(): { fieldErrors: Record<string, string[] | undefined> } } },
): AdminActionState {
  const fields = result.error.flatten().fieldErrors;
  return {
    status: "error",
    message: "请填写有效的治理原因。",
    fieldErrors: { reason: fields.reason?.[0] },
  };
}

async function moderateCollection(
  targetId: string,
  reason: string,
  hidden: boolean,
): Promise<AdminActionState> {
  let admin: AuthoritativeUser;
  try {
    admin = await requireAdmin("/admin/collections");
  } catch (error) {
    if (error instanceof AccessControlError) {
      return { status: "error", message: "你没有执行此管理操作的权限。" };
    }
    throw error;
  }
  try {
    await setCollectionHidden(admin.id, targetId, reason, hidden);
    revalidateCollection(targetId);
    revalidatePath("/admin/audit");
    revalidatePath("/notifications");
    return {
      status: "success",
      message: hidden ? "特辑已隐藏。" : "特辑已恢复。",
    };
  } catch (error) {
    if (error instanceof CollectionModerationError) {
      return {
        status: "error",
        message:
          error.code === "not_found"
            ? "特辑不存在。"
            : "特辑已被其他操作修改，请刷新后重试。",
      };
    }
    throw error;
  }
}

export async function hideCollectionAction(
  targetId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  void _previous;
  const parsed = hideCollectionInputSchema.safeParse({
    targetId,
    reason: formData.get("reason"),
  });
  if (!parsed.success) return moderationValidationState(parsed);
  return moderateCollection(parsed.data.targetId, parsed.data.reason, true);
}

export async function restoreCollectionAction(
  targetId: string,
  _previous: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  void _previous;
  const parsed = restoreCollectionInputSchema.safeParse({
    targetId,
    reason: formData.get("reason"),
  });
  if (!parsed.success) return moderationValidationState(parsed);
  return moderateCollection(parsed.data.targetId, parsed.data.reason, false);
}
