import { describe, expect, it } from "vitest";

import {
  formatPoemDate,
  toDateInputValue,
} from "@/features/posts/formatters";

describe("poem date formatters", () => {
  it("formats a date-only value with UTC fields", () => {
    expect(toDateInputValue(new Date("2026-08-02T00:00:00.000Z"))).toBe(
      "2026-08-02",
    );
  });

  it("formats a readable Chinese date", () => {
    expect(formatPoemDate(new Date("2026-08-02T12:00:00.000Z"))).toMatch(
      /2026年8月2日/,
    );
  });
});
