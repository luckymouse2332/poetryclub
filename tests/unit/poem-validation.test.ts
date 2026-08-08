import { describe, expect, it } from "vitest";

import {
  BODY_MAX_LENGTH,
  CONTEXT_MAX_LENGTH,
  POEM_MAX_PAGE,
  TITLE_MAX_LENGTH,
  creationTokenSchema,
  occurredAtSchema,
  pageSchema,
  poemIdSchema,
  poemInputSchema,
  poemVisibilitySchema,
} from "@/server/validation/poems";

const validInput = {
  title: "春晓",
  body: "春眠不觉晓，\n处处闻啼鸟。",
  context: "孟浩然的旧作",
  occurredAt: "2026-08-02",
  visibility: "public",
};

describe("poemInputSchema title", () => {
  it("trims surrounding whitespace from the title", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      title: "  春晓  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("春晓");
    }
  });

  it("rejects an empty title", () => {
    const result = poemInputSchema.safeParse({ ...validInput, title: "" });

    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only title", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      title: "   \t ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a title longer than the maximum length", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      title: "a".repeat(TITLE_MAX_LENGTH + 1),
    });

    expect(result.success).toBe(false);
  });

  it("accepts a title exactly at the maximum length", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      title: "a".repeat(TITLE_MAX_LENGTH),
    });

    expect(result.success).toBe(true);
  });

  it("rejects a non-string title", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      title: null,
    });

    expect(result.success).toBe(false);
  });
});

describe("poemInputSchema body", () => {
  it("preserves newlines and content exactly", () => {
    const body = "第一行\n\n\n第二行\n\t缩进行  尾随空格  ";
    const result = poemInputSchema.safeParse({
      ...validInput,
      body,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBe(body);
    }
  });

  it("rejects an empty body", () => {
    const result = poemInputSchema.safeParse({ ...validInput, body: "" });

    expect(result.success).toBe(false);
  });

  it("rejects a whitespace-only body", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      body: " \n\t ",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a body longer than the maximum length", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      body: "a".repeat(BODY_MAX_LENGTH + 1),
    });

    expect(result.success).toBe(false);
  });

  it("accepts a body exactly at the maximum length", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      body: "a".repeat(BODY_MAX_LENGTH),
    });

    expect(result.success).toBe(true);
  });

  it("rejects a non-string body", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      body: null,
    });

    expect(result.success).toBe(false);
  });
});

describe("poemInputSchema context", () => {
  it("turns an empty context into null", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      context: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.context).toBeNull();
    }
  });

  it("turns a whitespace-only context into null", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      context: " \n\t ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.context).toBeNull();
    }
  });

  it("turns a null context into null", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      context: null,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.context).toBeNull();
    }
  });

  it("turns a missing context into null", () => {
    const withoutContext = {
      title: validInput.title,
      body: validInput.body,
      occurredAt: validInput.occurredAt,
      visibility: validInput.visibility,
    };
    const result = poemInputSchema.safeParse(withoutContext);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.context).toBeNull();
    }
  });

  it("trims a non-empty context", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      context: "  写作背景  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.context).toBe("写作背景");
    }
  });

  it("rejects a context longer than the maximum length", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      context: "a".repeat(CONTEXT_MAX_LENGTH + 1),
    });

    expect(result.success).toBe(false);
  });
});

describe("poemInputSchema occurredAt", () => {
  it("parses a valid date into a Date at UTC 00:00", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      occurredAt: "2026-08-02",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.occurredAt).toBeInstanceOf(Date);
      expect(result.data.occurredAt?.toISOString()).toBe(
        "2026-08-02T00:00:00.000Z",
      );
    }
  });

  it("turns an empty occurredAt into null", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      occurredAt: "",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.occurredAt).toBeNull();
    }
  });

  it("turns a null occurredAt into null", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      occurredAt: null,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.occurredAt).toBeNull();
    }
  });

  it("turns a missing occurredAt into null", () => {
    const withoutOccurredAt = {
      title: validInput.title,
      body: validInput.body,
      context: validInput.context,
      visibility: validInput.visibility,
    };
    const result = poemInputSchema.safeParse(withoutOccurredAt);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.occurredAt).toBeNull();
    }
  });

  it("rejects non-YYYY-MM-DD formats", () => {
    for (const value of [
      "2026/08/02",
      "2026-8-2",
      "02-08-2026",
      "20260802",
      "2026-08-02T00:00:00.000Z",
      "2026-08-02 00:00:00",
    ]) {
      expect(
        poemInputSchema.safeParse({ ...validInput, occurredAt: value }).success,
      ).toBe(false);
    }
  });

  it("rejects non-existent dates", () => {
    for (const value of [
      "2026-02-30",
      "2026-04-31",
      "2026-13-01",
      "2026-00-10",
      "2026-01-00",
    ]) {
      expect(
        poemInputSchema.safeParse({ ...validInput, occurredAt: value }).success,
      ).toBe(false);
    }
  });

  it("accepts leap-day dates that exist", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      occurredAt: "2024-02-29",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.occurredAt?.toISOString()).toBe(
        "2024-02-29T00:00:00.000Z",
      );
    }
  });

  it("rejects a date with surrounding whitespace (strict format)", () => {
    const result = poemInputSchema.safeParse({
      ...validInput,
      occurredAt: " 2026-08-02 ",
    });

    expect(result.success).toBe(false);
  });
});

describe("occurredAtSchema standalone", () => {
  it("accepts string, null and undefined inputs", () => {
    expect(occurredAtSchema.safeParse("2026-01-01").success).toBe(true);
    expect(occurredAtSchema.safeParse(null).success).toBe(true);
    expect(occurredAtSchema.safeParse(undefined).success).toBe(true);
  });
});

describe("poemInputSchema visibility", () => {
  it("accepts public and members_only", () => {
    for (const visibility of ["public", "members_only"] as const) {
      const result = poemInputSchema.safeParse({ ...validInput, visibility });
      expect(result.success).toBe(true);
      expect(poemVisibilitySchema.safeParse(visibility).success).toBe(true);
    }
  });

  it("requires an explicit supported visibility", () => {
    const missingVisibility = {
      title: validInput.title,
      body: validInput.body,
      context: validInput.context,
      occurredAt: validInput.occurredAt,
    };
    expect(poemInputSchema.safeParse(missingVisibility).success).toBe(false);

    for (const visibility of ["", "private", "members", null, undefined]) {
      expect(
        poemInputSchema.safeParse({ ...validInput, visibility }).success,
      ).toBe(false);
    }
  });
});

describe("poemIdSchema and creationTokenSchema", () => {
  const validUuid = "123e4567-e89b-12d3-a456-426614174000";

  it("accepts a valid UUID", () => {
    expect(poemIdSchema.safeParse(validUuid).success).toBe(true);
    expect(creationTokenSchema.safeParse(validUuid).success).toBe(true);
  });

  it("rejects non-UUID values", () => {
    for (const value of [
      "",
      "poem-123",
      "123",
      "123e4567-e89b-12d3-a456-42661417400",
      "123e4567-e89b-12d3-a456-4266141740000",
    ]) {
      expect(poemIdSchema.safeParse(value).success).toBe(false);
      expect(creationTokenSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects non-string values", () => {
    expect(poemIdSchema.safeParse(123).success).toBe(false);
    expect(creationTokenSchema.safeParse(null).success).toBe(false);
  });
});

describe("pageSchema", () => {
  it("defaults missing input to 1", () => {
    expect(pageSchema.safeParse(undefined).success).toBe(true);
    expect(pageSchema.parse(undefined)).toBe(1);
  });

  it("defaults an empty string to 1", () => {
    expect(pageSchema.parse("")).toBe(1);
  });

  it("parses decimal digit strings within range", () => {
    expect(pageSchema.parse("1")).toBe(1);
    expect(pageSchema.parse("5")).toBe(5);
    expect(pageSchema.parse(String(POEM_MAX_PAGE))).toBe(POEM_MAX_PAGE);
  });

  it("rejects out-of-range and malformed pages", () => {
    for (const value of [
      "0",
      "-1",
      String(POEM_MAX_PAGE + 1),
      "abc",
      "1.5",
      " 5",
      "5 ",
      "1e2",
      "0x10",
      null,
    ]) {
      expect(pageSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects non string/undefined inputs", () => {
    expect(pageSchema.safeParse(5).success).toBe(false);
  });
});
