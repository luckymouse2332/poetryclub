import { z } from "zod";

export const MODERATION_PAGE_SIZE = 20;
export const MODERATION_MAX_PAGE = 10000;
export const MODERATION_REASON_MAX_LENGTH = 500;
export const INVITATION_CODE_MIN_LENGTH = 32;
export const INVITATION_CODE_MAX_LENGTH = 128;
export const INVITATION_MAX_USES_LIMIT = 100;
export const INVITATION_MAX_DAYS_AHEAD = 365;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const DECIMAL_DIGITS_REGEX = /^\d+$/;
const URL_SAFE_CODE_REGEX = /^[A-Za-z0-9_-]+$/;

export const uuidTargetIdSchema = z
  .string()
  .regex(UUID_REGEX, "目标编号无效");

export const userTargetIdSchema = z
  .string()
  .min(1, "用户编号无效")
  .max(128, "用户编号无效")
  .regex(/^[A-Za-z0-9_-]+$/, "用户编号无效");

export const adminTargetTypeSchema = z.enum([
  "poem",
  "user",
  "invitation",
  "announcement",
  "comment",
]);

export const adminAuditActionSchema = z.enum([
  "poem_hidden",
  "poem_restored",
  "user_suspended",
  "user_restored",
  "user_promoted",
  "user_demoted",
  "invitation_created",
  "invitation_disabled",
  "announcement_created",
  "announcement_updated",
  "announcement_published",
  "comment_hidden",
  "comment_restored",
]);

export const userRoleSchema = z.enum(["member", "admin"]);

export const userStatusSchema = z.enum(["active", "suspended"]);

export const poemStatusSchema = z.enum(["draft", "published"]);

export const poemModerationStatusSchema = z.enum(["visible", "hidden"]);

export const moderationReasonSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, "请填写原因")
  .refine(
    (value) => value.length <= MODERATION_REASON_MAX_LENGTH,
    `原因不能超过 ${MODERATION_REASON_MAX_LENGTH} 个字符`,
  );

export const invitationCodeSchema = z
  .string()
  .regex(URL_SAFE_CODE_REGEX, "邀请码仅允许 URL 安全字符")
  .refine(
    (value) =>
      value.length >= INVITATION_CODE_MIN_LENGTH &&
      value.length <= INVITATION_CODE_MAX_LENGTH,
    `邀请码长度需在 ${INVITATION_CODE_MIN_LENGTH} 到 ${INVITATION_CODE_MAX_LENGTH} 之间`,
  );

export const maxUsesSchema = z.coerce
  .number()
  .int("使用次数必须是整数")
  .min(1, "使用次数至少为 1")
  .max(INVITATION_MAX_USES_LIMIT, `使用次数不能超过 ${INVITATION_MAX_USES_LIMIT}`);

export const moderationPageSchema = z
  .string()
  .optional()
  .transform((value) => {
    if (value === undefined || value === "") {
      return 1;
    }
    if (!DECIMAL_DIGITS_REGEX.test(value)) {
      return Number.NaN;
    }
    return Number(value);
  })
  .refine(
    (value) =>
      Number.isInteger(value) && value >= 1 && value <= MODERATION_MAX_PAGE,
    `页码必须是 1 到 ${MODERATION_MAX_PAGE} 之间的整数`,
  );

function createInvitationExpiresAtSchema(now: () => Date) {
  return z
    .string()
    .transform((value) => new Date(value))
    .superRefine((value, context) => {
      const valueMs = value.getTime();
      if (Number.isNaN(valueMs)) {
        context.addIssue({ code: "custom", message: "请选择有效的过期时间" });
        return;
      }
      const nowMs = now().getTime();
      if (valueMs <= nowMs) {
        context.addIssue({ code: "custom", message: "过期时间必须晚于当前时间" });
      }
      const maxMs = INVITATION_MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000;
      if (valueMs - nowMs > maxMs) {
        context.addIssue({
          code: "custom",
          message: `过期时间最多为 ${INVITATION_MAX_DAYS_AHEAD} 天`,
        });
      }
    });
}

export function createInvitationInputSchema(
  now: () => Date = () => new Date(),
) {
  return z.object({
    maxUses: maxUsesSchema,
    expiresAt: createInvitationExpiresAtSchema(now),
  });
}

export const hidePoemInputSchema = z.object({
  targetId: uuidTargetIdSchema,
  reason: moderationReasonSchema,
});

export const restorePoemInputSchema = z.object({
  targetId: uuidTargetIdSchema,
  reason: moderationReasonSchema,
});

export const suspendUserInputSchema = z.object({
  targetId: userTargetIdSchema,
  reason: moderationReasonSchema,
});

export const restoreUserInputSchema = z.object({
  targetId: userTargetIdSchema,
  reason: moderationReasonSchema,
});

export const updateUserRoleInputSchema = z.object({
  targetId: userTargetIdSchema,
  reason: moderationReasonSchema,
  newRole: userRoleSchema,
});

export const disableInvitationInputSchema = z.object({
  targetId: uuidTargetIdSchema,
  reason: moderationReasonSchema,
});

export const moderationUserListInputSchema = z.object({
  page: moderationPageSchema,
  status: z.preprocess(
    (value) => (value === "" ? undefined : value),
    userStatusSchema.optional(),
  ),
  role: z.preprocess(
    (value) => (value === "" ? undefined : value),
    userRoleSchema.optional(),
  ),
  q: z
    .string()
    .optional()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    })
    .refine(
      (value) => value === undefined || value.length <= 100,
      "搜索词不能超过 100 个字符",
    ),
});

export const moderationPoemListInputSchema = z.object({
  page: moderationPageSchema,
  status: z.preprocess(
    (value) => (value === "" ? undefined : value),
    poemStatusSchema.optional(),
  ),
  moderationStatus: z.preprocess(
    (value) => (value === "" ? undefined : value),
    poemModerationStatusSchema.optional(),
  ),
  authorId: z.preprocess(
    (value) => (value === "" ? undefined : value),
    userTargetIdSchema.optional(),
  ),
  q: z
    .string()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine(
      (value) => value === undefined || value.length <= 100,
      "搜索词不能超过 100 个字符",
    ),
});

export type HidePoemInput = z.infer<typeof hidePoemInputSchema>;
export type RestorePoemInput = z.infer<typeof restorePoemInputSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserInputSchema>;
export type RestoreUserInput = z.infer<typeof restoreUserInputSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleInputSchema>;
export type DisableInvitationInput = z.infer<
  typeof disableInvitationInputSchema
>;
export type ModerationUserListInput = z.infer<
  typeof moderationUserListInputSchema
>;
export type ModerationPoemListInput = z.infer<
  typeof moderationPoemListInputSchema
>;
export type InvitationInput = z.infer<
  ReturnType<typeof createInvitationInputSchema>
>;
