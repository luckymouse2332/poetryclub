import { describe, expect, it } from "vitest";

import { formatNotificationDate } from "@/features/notifications/formatters";

describe("formatNotificationDate", () => {
  const now = new Date(2026, 7, 9, 16, 54, 30);

  it("formats very recent notifications as just now", () => {
    expect(formatNotificationDate(new Date(2026, 7, 9, 16, 54, 10), now)).toBe(
      "刚刚",
    );
  });

  it("formats notifications within the hour in minutes", () => {
    expect(formatNotificationDate(new Date(2026, 7, 9, 16, 42), now)).toBe(
      "12 分钟前",
    );
  });

  it("uses today and yesterday labels for nearby dates", () => {
    expect(formatNotificationDate(new Date(2026, 7, 9, 12, 30), now)).toBe(
      "今天 12:30",
    );
    expect(formatNotificationDate(new Date(2026, 7, 8, 20, 15), now)).toBe(
      "昨天 20:15",
    );
  });
});
