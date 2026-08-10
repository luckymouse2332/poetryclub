import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  announcementIdSchema,
  announcementInputSchema,
  announcementListInputSchema,
  notificationListInputSchema,
} from "@/server/validation/notifications";
import {
  getNotificationOpenHref,
  getNotificationDefinition,
  isKnownNotificationType,
} from "@/server/services/notifications/definitions";

describe("notification validation", () => {
  it("accepts UUID announcement ids and rejects malformed ids", () => {
    expect(
      announcementIdSchema.parse("00000000-0000-0000-0000-000000000000"),
    ).toBe("00000000-0000-0000-0000-000000000000");
    expect(() => announcementIdSchema.parse("announcement-1")).toThrow(
      "公告编号无效",
    );
  });

  it("accepts and normalizes announcement text and internal links", () => {
    expect(
      announcementInputSchema.parse({
        title: "  站内更新  ",
        body: "  新功能已上线。  ",
        href: "  /notifications  ",
        audience: "active_members",
      }),
    ).toEqual({
      title: "站内更新",
      body: "新功能已上线。",
      href: "/notifications",
      audience: "active_members",
    });
  });

  it("rejects external notification links", () => {
    expect(() =>
      announcementInputSchema.parse({
        title: "公告",
        body: "正文",
        href: "https://example.com",
        audience: "all_accounts",
      }),
    ).toThrow("站内相对路径");

    expect(() =>
      announcementInputSchema.parse({
        title: "公告",
        body: "正文",
        href: "//example.com",
        audience: "all_accounts",
      }),
    ).toThrow("站内相对路径");
  });

  it("bounds notification and announcement pagination", () => {
    expect(notificationListInputSchema.parse({})).toEqual({
      page: 1,
      filter: "all",
    });
    expect(
      notificationListInputSchema.parse({ page: "2", filter: "unread" }),
    ).toEqual({ page: 2, filter: "unread" });
    expect(() => notificationListInputSchema.parse({ page: "0" })).toThrow();
    expect(announcementListInputSchema.parse({ status: "draft" })).toEqual({
      page: 1,
      status: "draft",
    });
  });
});

describe("notification definitions", () => {
  it("supports known and forward-compatible event types", () => {
    expect(isKnownNotificationType("system.announcement")).toBe(true);
    expect(isKnownNotificationType("reaction.liked")).toBe(false);
    expect(getNotificationDefinition("reaction.liked")).toEqual({
      category: "system",
      label: "站内通知",
    });
  });

  it("opens announcements in their member-readable detail page", () => {
    expect(
      getNotificationOpenHref({
        type: "system.announcement",
        targetType: "announcement",
        targetId: "announcement/with spaces",
        href: "/about",
      }),
    ).toBe("/announcements/announcement%2Fwith%20spaces");
    expect(
      getNotificationOpenHref({
        type: "moderation.user_suspended",
        targetType: "user",
        targetId: "user-1",
        href: "/account",
      }),
    ).toBe("/account");
  });
});
