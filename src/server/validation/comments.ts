import { z } from "zod";

import { moderationPageSchema, moderationReasonSchema } from "./moderation";

export const COMMENT_BODY_MAX_LENGTH = 2000;
export const COMMENT_ROOT_PAGE_SIZE = 10;
export const COMMENT_REPLY_PREVIEW_SIZE = 3;
export const COMMENT_REPLY_PAGE_SIZE = 20;
export const COMMENT_PUBLISH_COOLDOWN_SECONDS = 10;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export const commentIdSchema = z.string().regex(UUID_REGEX, "评论编号无效");
export const commentCreationTokenSchema = z
  .string()
  .regex(UUID_REGEX, "提交标识无效，请刷新页面后重试");

export const commentBodySchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, "请填写评论内容")
  .refine(
    (value) => value.length <= COMMENT_BODY_MAX_LENGTH,
    `评论不能超过 ${COMMENT_BODY_MAX_LENGTH} 个字符`,
  );

export const createCommentInputSchema = z.object({
  poemId: commentIdSchema,
  parentId: commentIdSchema.nullable(),
  body: commentBodySchema,
  creationToken: commentCreationTokenSchema,
});

export const updateCommentInputSchema = z.object({
  poemId: commentIdSchema,
  commentId: commentIdSchema,
  body: commentBodySchema,
});

export const deleteCommentInputSchema = z.object({
  poemId: commentIdSchema,
  commentId: commentIdSchema,
});

export const commentCursorSchema = z
  .string()
  .min(1, "游标无效")
  .max(512, "游标无效")
  .regex(/^[A-Za-z0-9_-]+$/, "游标无效")
  .optional();

export const commentFocusSchema = commentIdSchema.optional();
export const commentModerationStatusSchema = z.enum(["visible", "hidden"]);

export const moderationCommentListInputSchema = z.object({
  page: moderationPageSchema,
  moderationStatus: z.preprocess(
    (value) => (value === "" ? undefined : value),
    commentModerationStatusSchema.optional(),
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

export const moderateCommentInputSchema = z.object({
  targetId: commentIdSchema,
  reason: moderationReasonSchema,
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;
export type DeleteCommentInput = z.infer<typeof deleteCommentInputSchema>;
export type ModerationCommentListInput = z.infer<
  typeof moderationCommentListInputSchema
>;
