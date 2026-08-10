"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { AnnouncementActionState } from "@/features/notifications/announcement-action-state";
import { requireAdmin } from "@/server/policies/access";
import {
  AnnouncementMutationError,
  createAnnouncementDraft,
  publishAnnouncement,
  updateAnnouncementDraft,
} from "@/server/services/notifications";
import {
  announcementIdSchema,
  announcementInputSchema,
} from "@/server/validation/notifications";

export type { AnnouncementActionState } from "@/features/notifications/announcement-action-state";

function readString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readInput(formData: FormData) {
  return {
    title: readString(formData, "title"),
    body: readString(formData, "body"),
    href: readString(formData, "href"),
    audience: readString(formData, "audience"),
  };
}

function validationState(
  result: Exclude<ReturnType<typeof announcementInputSchema.safeParse>, { success: true }>,
): AnnouncementActionState {
  const fields = result.error.flatten().fieldErrors;
  return {
    status: "error",
    message: "请检查公告内容。",
    fieldErrors: {
      title: fields.title?.[0],
      body: fields.body?.[0],
      href: fields.href?.[0],
      audience: fields.audience?.[0],
    },
  };
}

function mutationState(error: unknown): AnnouncementActionState | null {
  if (!(error instanceof AnnouncementMutationError)) return null;
  const messages = {
    not_found: "公告不存在。",
    already_published: "公告已经发布，不能继续修改。",
    concurrent_conflict: "公告已被其他操作修改，请刷新后重试。",
    empty_audience: "当前受众没有可接收公告的账号。",
  } as const;
  return { status: "error", message: messages[error.code] };
}

export async function createAnnouncementAction(
  _previous: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const admin = await requireAdmin("/admin/announcements");
  const parsed = announcementInputSchema.safeParse(readInput(formData));
  if (!parsed.success) return validationState(parsed);
  const id = await createAnnouncementDraft(admin.id, parsed.data);
  revalidatePath("/admin/announcements");
  revalidatePath("/admin/audit");
  redirect(`/admin/announcements/${id}/edit?created=1`);
}

export async function updateAnnouncementAction(
  id: string,
  _previous: AnnouncementActionState,
  formData: FormData,
): Promise<AnnouncementActionState> {
  const admin = await requireAdmin("/admin/announcements");
  const parsedId = announcementIdSchema.safeParse(id);
  if (!parsedId.success) return { status: "error", message: "公告编号无效。" };
  const parsed = announcementInputSchema.safeParse(readInput(formData));
  if (!parsed.success) return validationState(parsed);
  try {
    await updateAnnouncementDraft(admin.id, parsedId.data, parsed.data);
  } catch (error) {
    const state = mutationState(error);
    if (state) return state;
    throw error;
  }
  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${parsedId.data}/edit`);
  revalidatePath("/admin/audit");
  return { status: "success", message: "公告草稿已保存。" };
}

export async function publishAnnouncementAction(
  id: string,
  _previous: AnnouncementActionState,
  _formData: FormData,
): Promise<AnnouncementActionState> {
  void _formData;
  const admin = await requireAdmin("/admin/announcements");
  const parsedId = announcementIdSchema.safeParse(id);
  if (!parsedId.success) return { status: "error", message: "公告编号无效。" };
  try {
    await publishAnnouncement(admin.id, parsedId.data);
  } catch (error) {
    const state = mutationState(error);
    if (state) return state;
    throw error;
  }
  revalidatePath("/", "layout");
  revalidatePath("/notifications");
  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${parsedId.data}/edit`);
  revalidatePath("/admin/audit");
  return { status: "success", message: "公告已发布。" };
}
