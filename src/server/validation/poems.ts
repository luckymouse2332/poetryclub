import { z } from "zod";

export const TITLE_MAX_LENGTH = 120;
export const BODY_MAX_LENGTH = 20000;
export const CONTEXT_MAX_LENGTH = 2000;
export const POEM_PAGE_SIZE = 12;
export const POEM_MAX_PAGE = 10000;

export const poemVisibilitySchema = z.enum(["public", "members_only"], {
  error: "请选择作品访问范围",
});

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

const DECIMAL_DIGITS_REGEX = /^\d+$/;

const INVALID_DATE = Symbol("invalid-date");

/** Parses a strict YYYY-MM-DD string into a Date at UTC 00:00, or null when invalid. */
function parseStrictDateOnly(value: string): Date | null {
  const match = DATE_ONLY_REGEX.exec(value);
  if (match === null) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  // setUTCFullYear handles years 0-99 correctly (unlike Date.UTC which maps
  // them to 1900-1999), so every real calendar date survives the round-trip.
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export const poemIdSchema = z
  .string()
  .regex(UUID_REGEX, "作品编号无效");

export const creationTokenSchema = z
  .string()
  .regex(UUID_REGEX, "提交标识无效，请刷新页面后重试");

const titleSchema = z
  .string()
  .transform((value) => value.trim())
  .refine((value) => value.length > 0, "请填写标题")
  .refine(
    (value) => value.length <= TITLE_MAX_LENGTH,
    `标题不能超过 ${TITLE_MAX_LENGTH} 个字符`,
  );

const bodySchema = z
  .string()
  .refine(
    (value) => value.trim().length > 0,
    "请填写正文",
  )
  .refine(
    (value) => value.length <= BODY_MAX_LENGTH,
    `正文不能超过 ${BODY_MAX_LENGTH} 个字符`,
  );

const contextSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === null || value === undefined) {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? null : trimmed;
  })
  .refine(
    (value) => value === null || value.length <= CONTEXT_MAX_LENGTH,
    `创作背景不能超过 ${CONTEXT_MAX_LENGTH} 个字符`,
  );

export const occurredAtSchema = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value): Date | null | typeof INVALID_DATE => {
    if (value === null || value === undefined || value.trim() === "") {
      return null;
    }
    return parseStrictDateOnly(value) ?? INVALID_DATE;
  })
  .refine(
    (value): value is Date | null => value !== INVALID_DATE,
    "请选择有效的事件日期",
  );

export const poemInputSchema = z.object({
  title: titleSchema,
  body: bodySchema,
  context: contextSchema,
  occurredAt: occurredAtSchema,
  visibility: poemVisibilitySchema,
});

export const pageSchema = z
  .union([z.string(), z.undefined()])
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
      Number.isInteger(value) && value >= 1 && value <= POEM_MAX_PAGE,
    `页码必须是 1 到 ${POEM_MAX_PAGE} 之间的整数`,
  );

export type PoemInput = z.infer<typeof poemInputSchema>;
export type PoemVisibility = z.infer<typeof poemVisibilitySchema>;
export type PoemInputFieldErrors = z.inferFlattenedErrors<
  typeof poemInputSchema
>;
