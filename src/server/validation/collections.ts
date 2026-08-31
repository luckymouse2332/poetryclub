import { z } from "zod";

import { creationTokenSchema, pageSchema, poemIdSchema } from "./poems";

export const COLLECTION_TITLE_MAX_LENGTH = 120;
export const COLLECTION_DESCRIPTION_MAX_LENGTH = 2000;
export const COLLECTION_PAGE_SIZE = 12;

export const collectionIdSchema = poemIdSchema;
export { creationTokenSchema as collectionCreationTokenSchema };

export const collectionVisibilitySchema = z.enum(["public", "members_only"], {
  error: "请选择特辑访问范围",
});

const collectionTitleSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, "请填写标题")
  .refine(
    (value) => value.length <= COLLECTION_TITLE_MAX_LENGTH,
    `标题不能超过 ${COLLECTION_TITLE_MAX_LENGTH} 个字符`,
  );

const collectionDescriptionSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === null || value === undefined) return null;
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  })
  .refine(
    (value) =>
      value === null || value.length <= COLLECTION_DESCRIPTION_MAX_LENGTH,
    `简介不能超过 ${COLLECTION_DESCRIPTION_MAX_LENGTH} 个字符`,
  );

export const collectionInputSchema = z.object({
  title: collectionTitleSchema,
  description: collectionDescriptionSchema,
  visibility: collectionVisibilitySchema,
});

export const collectionItemInputSchema = z.object({
  collectionId: collectionIdSchema,
  poemId: poemIdSchema,
});

export const collectionMoveInputSchema = collectionItemInputSchema.extend({
  direction: z.enum(["up", "down"]),
});

export const collectionPageSchema = pageSchema;

export type CollectionInput = z.infer<typeof collectionInputSchema>;
export type CollectionVisibility = z.infer<typeof collectionVisibilitySchema>;
export type CollectionMoveDirection = z.infer<
  typeof collectionMoveInputSchema
>["direction"];
