import { z } from "zod";

export const NOTIFICATION_PAGE_SIZE = 20;
export const NOTIFICATION_RECENT_LIMIT = 5;
export const NOTIFICATION_MAX_PAGE = 10000;
export const ANNOUNCEMENT_TITLE_MAX_LENGTH = 120;
export const ANNOUNCEMENT_BODY_MAX_LENGTH = 4000;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const DECIMAL_DIGITS_REGEX = /^\d+$/;

export const notificationIdSchema = z
  .string()
  .regex(UUID_REGEX, "通知编号无效");

export const announcementIdSchema = z
  .string()
  .regex(UUID_REGEX, "公告编号无效");

export const notificationFilterSchema = z.enum(["all", "unread"]);

export const announcementAudienceSchema = z.enum([
  "all_accounts",
  "active_accounts",
  "active_members",
  "active_admins",
]);

export const announcementStatusSchema = z.enum(["draft", "published"]);

export const internalNotificationHrefSchema = z
  .string()
  .transform((value) => value.trim())
  .refine(
    (value) => value === "" || (value.startsWith("/") && !value.startsWith("//")),
    "链接必须是站内相对路径",
  )
  .refine(
    (value) => !value.includes("\\") && !/[\u0000-\u001f\u007f]/.test(value),
    "链接包含无效字符",
  )
  .transform((value) => (value === "" ? null : value));

export const announcementInputSchema = z.object({
  title: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "请填写公告标题")
    .refine(
      (value) => value.length <= ANNOUNCEMENT_TITLE_MAX_LENGTH,
      `公告标题不能超过 ${ANNOUNCEMENT_TITLE_MAX_LENGTH} 个字符`,
    ),
  body: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, "请填写公告正文")
    .refine(
      (value) => value.length <= ANNOUNCEMENT_BODY_MAX_LENGTH,
      `公告正文不能超过 ${ANNOUNCEMENT_BODY_MAX_LENGTH} 个字符`,
    ),
  href: internalNotificationHrefSchema,
  audience: announcementAudienceSchema,
});

function parsePage(value: unknown): number {
  if (value === undefined || value === "") return 1;
  if (typeof value !== "string" || !DECIMAL_DIGITS_REGEX.test(value)) {
    return Number.NaN;
  }
  return Number(value);
}

export const notificationListInputSchema = z.object({
  page: z
    .preprocess(parsePage, z.number())
    .refine(
      (value) =>
        Number.isInteger(value) && value >= 1 && value <= NOTIFICATION_MAX_PAGE,
      `页码必须是 1 到 ${NOTIFICATION_MAX_PAGE} 之间的整数`,
    ),
  filter: z.preprocess(
    (value) => (value === undefined || value === "" ? "all" : value),
    notificationFilterSchema,
  ),
});

export const announcementListInputSchema = z.object({
  page: z
    .preprocess(parsePage, z.number())
    .refine(
      (value) =>
        Number.isInteger(value) && value >= 1 && value <= NOTIFICATION_MAX_PAGE,
      `页码必须是 1 到 ${NOTIFICATION_MAX_PAGE} 之间的整数`,
    ),
  status: z.preprocess(
    (value) => (value === undefined || value === "" ? undefined : value),
    announcementStatusSchema.optional(),
  ),
});

export type NotificationFilter = z.infer<typeof notificationFilterSchema>;
export type NotificationListInput = z.infer<typeof notificationListInputSchema>;
export type AnnouncementAudience = z.infer<typeof announcementAudienceSchema>;
export type AnnouncementInput = z.infer<typeof announcementInputSchema>;
export type AnnouncementListInput = z.infer<typeof announcementListInputSchema>;
