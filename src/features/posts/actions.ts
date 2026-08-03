"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  AccessControlError,
  requireActiveUser,
  type AuthoritativeUser,
} from "@/server/policies/access";
import {
  PoemMutationError,
  createDraft,
  deleteOwnDraft,
  publishOwnDraft,
  updateOwnPoem,
  withdrawOwnPublishedPoem,
} from "@/server/services/poems";
import {
  creationTokenSchema,
  poemIdSchema,
  poemInputSchema,
} from "@/server/validation/poems";

export type PoemActionState = Readonly<{
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Readonly<{
    title?: string;
    body?: string;
    context?: string;
    occurredAt?: string;
  }>;
}>;

function readPoemInput(formData: FormData) {
  return poemInputSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    context: formData.get("context"),
    occurredAt: formData.get("occurredAt"),
  });
}

function validationState(
  result: Exclude<ReturnType<typeof readPoemInput>, { success: true }>,
): PoemActionState {
  const fields = result.error.flatten().fieldErrors;
  return {
    status: "error",
    message: "请检查表单中的内容。",
    fieldErrors: {
      title: fields.title?.[0],
      body: fields.body?.[0],
      context: fields.context?.[0],
      occurredAt: fields.occurredAt?.[0],
    },
  };
}

function operationErrorState(): PoemActionState {
  return {
    status: "error",
    message: "操作未完成。作品可能已变化，或你无权操作该作品，请刷新后重试。",
  };
}

function suspendedErrorState(): PoemActionState {
  return {
    status: "error",
    message: "你的账号已被禁用，目前只能查看内容，不能修改诗作。请联系管理员。",
  };
}

async function requirePoemWriter(returnTo: string): Promise<AuthoritativeUser | PoemActionState> {
  try {
    return await requireActiveUser(returnTo);
  } catch (error) {
    if (
      error instanceof AccessControlError &&
      error.code === "account_suspended"
    ) {
      return suspendedErrorState();
    }
    throw error;
  }
}

function isActionState(
  value: AuthoritativeUser | PoemActionState,
): value is PoemActionState {
  return "message" in value || "fieldErrors" in value;
}

function revalidatePublicPoem(id: string): void {
  revalidatePath("/");
  revalidatePath("/poems");
  revalidatePath(`/poems/${id}`);
}

export async function createPoemAction(
  _previousState: PoemActionState,
  formData: FormData,
): Promise<PoemActionState> {
  const currentUser = await requirePoemWriter("/account/poems/new");
  if (isActionState(currentUser)) return currentUser;
  const input = readPoemInput(formData);
  const creationToken = creationTokenSchema.safeParse(
    formData.get("creationToken"),
  );

  if (!input.success) {
    return validationState(input);
  }
  if (!creationToken.success) {
    return { status: "error", message: creationToken.error.issues[0]?.message };
  }

  const id = await createDraft(currentUser.id, creationToken.data, input.data);
  revalidatePath("/account/poems");
  redirect(`/account/poems/${id}/edit?created=1`);
}

export async function updatePoemAction(
  id: string,
  _previousState: PoemActionState,
  formData: FormData,
): Promise<PoemActionState> {
  const currentUser = await requirePoemWriter("/account/poems");
  if (isActionState(currentUser)) return currentUser;
  const parsedId = poemIdSchema.safeParse(id);
  const input = readPoemInput(formData);

  if (!parsedId.success) {
    return operationErrorState();
  }
  if (!input.success) {
    return validationState(input);
  }

  try {
    const status = await updateOwnPoem(parsedId.data, currentUser.id, input.data);
    revalidatePath("/account/poems");
    revalidatePath(`/account/poems/${parsedId.data}/edit`);
    if (status === "published") {
      revalidatePublicPoem(parsedId.data);
    }
  } catch (error) {
    if (error instanceof PoemMutationError) {
      return operationErrorState();
    }
    throw error;
  }

  redirect(`/account/poems/${parsedId.data}/edit?saved=1`);
}

export async function publishPoemAction(
  id: string,
  _previousState: PoemActionState,
  _formData: FormData,
): Promise<PoemActionState> {
  void _previousState;
  void _formData;
  const currentUser = await requirePoemWriter("/account/poems");
  if (isActionState(currentUser)) return currentUser;
  const parsedId = poemIdSchema.safeParse(id);
  if (!parsedId.success) {
    return operationErrorState();
  }

  try {
    const published = await publishOwnDraft(parsedId.data, currentUser.id);
    revalidatePath("/account/poems");
    revalidatePath(`/account/poems/${parsedId.data}/edit`);
    revalidatePublicPoem(parsedId.data);
    if (published.moderationStatus === "hidden") {
      redirect(`/account/poems/${parsedId.data}/edit?published=1`);
    }
  } catch (error) {
    if (error instanceof PoemMutationError) {
      return operationErrorState();
    }
    throw error;
  }
  redirect(`/poems/${parsedId.data}`);
}

export async function withdrawPoemAction(
  id: string,
  _previousState: PoemActionState,
  _formData: FormData,
): Promise<PoemActionState> {
  void _previousState;
  void _formData;
  const currentUser = await requirePoemWriter("/account/poems");
  if (isActionState(currentUser)) return currentUser;
  const parsedId = poemIdSchema.safeParse(id);
  if (!parsedId.success) {
    return operationErrorState();
  }

  try {
    await withdrawOwnPublishedPoem(parsedId.data, currentUser.id);
  } catch (error) {
    if (error instanceof PoemMutationError) {
      return operationErrorState();
    }
    throw error;
  }
  revalidatePath("/account/poems");
  revalidatePath(`/account/poems/${parsedId.data}/edit`);
  revalidatePublicPoem(parsedId.data);
  redirect(`/account/poems/${parsedId.data}/edit?withdrawn=1`);
}

export async function deletePoemAction(
  id: string,
  _previousState: PoemActionState,
  _formData: FormData,
): Promise<PoemActionState> {
  void _previousState;
  void _formData;
  const currentUser = await requirePoemWriter("/account/poems");
  if (isActionState(currentUser)) return currentUser;
  const parsedId = poemIdSchema.safeParse(id);
  if (!parsedId.success) {
    return operationErrorState();
  }

  try {
    await deleteOwnDraft(parsedId.data, currentUser.id);
  } catch (error) {
    if (error instanceof PoemMutationError) {
      return operationErrorState();
    }
    throw error;
  }
  revalidatePath("/account/poems");
  redirect("/account/poems?deleted=1");
}
