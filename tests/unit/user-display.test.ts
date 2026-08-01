import { describe, expect, it } from "vitest";

import {
  formatCreatedAt,
  getUserDisplayName,
  maskEmail,
} from "@/features/auth/user-display";

describe("maskEmail", () => {
  it("masks the local part while keeping the first character", () => {
    expect(maskEmail("li.bai@example.com")).toBe("l***@example.com");
  });

  it("keeps a single-character local part", () => {
    expect(maskEmail("l@example.com")).toBe("l***@example.com");
  });

  it("trims surrounding whitespace before masking", () => {
    expect(maskEmail("  li@example.com  ")).toBe("l***@example.com");
  });

  it("returns a full mask for empty or whitespace-only input", () => {
    expect(maskEmail("")).toBe("***");
    expect(maskEmail("   ")).toBe("***");
  });

  it("returns a full mask for malformed email addresses", () => {
    expect(maskEmail("not-an-email")).toBe("***");
    expect(maskEmail("@example.com")).toBe("***");
    expect(maskEmail("user@")).toBe("***");
    expect(maskEmail("@")).toBe("***");
    expect(maskEmail("a@")).toBe("***");
  });
});

describe("getUserDisplayName", () => {
  it("returns the trimmed name when present", () => {
    expect(
      getUserDisplayName({ name: "  李白  ", email: "li@example.com" }),
    ).toBe("李白");
  });

  it("falls back to the masked email for empty or whitespace names", () => {
    expect(getUserDisplayName({ name: "", email: "li@example.com" })).toBe(
      "l***@example.com",
    );
    expect(getUserDisplayName({ name: "   ", email: "li@example.com" })).toBe(
      "l***@example.com",
    );
  });

  it("falls back to the full mask when the email is malformed too", () => {
    expect(getUserDisplayName({ name: "", email: "" })).toBe("***");
  });
});

describe("formatCreatedAt", () => {
  it("formats a local-noon date as a stable Chinese date", () => {
    // Constructed from local time components so the result is timezone-stable.
    const date = new Date(2026, 7, 1, 12, 0, 0);
    expect(formatCreatedAt(date)).toBe("2026年8月1日");
  });

  it("keeps a single-digit month and day unpadded", () => {
    const date = new Date(2026, 0, 5, 12, 0, 0);
    expect(formatCreatedAt(date)).toBe("2026年1月5日");
  });
});
