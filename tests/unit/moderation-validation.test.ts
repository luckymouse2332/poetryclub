import { describe, expect, it } from "vitest";

import {
  INVITATION_CODE_MAX_LENGTH,
  INVITATION_CODE_MIN_LENGTH,
  INVITATION_MAX_DAYS_AHEAD,
  INVITATION_MAX_USES_LIMIT,
  MODERATION_MAX_PAGE,
  MODERATION_REASON_MAX_LENGTH,
  createInvitationInputSchema,
  disableInvitationInputSchema,
  hidePoemInputSchema,
  invitationCodeSchema,
  maxUsesSchema,
  moderationPageSchema,
  moderationPoemListInputSchema,
  moderationReasonSchema,
  moderationUserListInputSchema,
  restorePoemInputSchema,
  restoreUserInputSchema,
  suspendUserInputSchema,
  updateUserRoleInputSchema,
  userTargetIdSchema,
  uuidTargetIdSchema,
} from "@/server/validation/moderation";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const BETTER_AUTH_USER_ID = "8f14e45fceea167a5a36dedd4bea2543";
const DAY_MS = 24 * 60 * 60 * 1000;
const FIXED_NOW = new Date("2026-08-03T00:00:00.000Z");

const forgedActionFields = {
  adminId: "forged-admin-id",
  role: "admin",
  status: "active",
  moderationStatus: "hidden",
};

describe("moderationReasonSchema", () => {
  it("trims surrounding whitespace", () => {
    const result = moderationReasonSchema.safeParse("  抄袭内容  ");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("抄袭内容");
    }
  });

  it("rejects an empty reason", () => {
    expect(moderationReasonSchema.safeParse("").success).toBe(false);
  });

  it("rejects a whitespace-only reason", () => {
    expect(moderationReasonSchema.safeParse("  \t\n ").success).toBe(false);
  });

  it("accepts a reason exactly at the maximum length", () => {
    const reason = "a".repeat(MODERATION_REASON_MAX_LENGTH);
    const result = moderationReasonSchema.safeParse(reason);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(reason);
    }
  });

  it("accepts a reason padded with whitespace that trims to the maximum length", () => {
    const result = moderationReasonSchema.safeParse(
      `  ${"a".repeat(MODERATION_REASON_MAX_LENGTH)}  `,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("a".repeat(MODERATION_REASON_MAX_LENGTH));
    }
  });

  it("rejects a reason longer than the maximum length", () => {
    expect(
      moderationReasonSchema.safeParse(
        "a".repeat(MODERATION_REASON_MAX_LENGTH + 1),
      ).success,
    ).toBe(false);
  });

  it("rejects a reason exceeding the maximum length after trimming", () => {
    expect(
      moderationReasonSchema.safeParse(
        `a${"b".repeat(MODERATION_REASON_MAX_LENGTH)} `,
      ).success,
    ).toBe(false);
  });

  it("rejects a non-string reason", () => {
    expect(moderationReasonSchema.safeParse(null).success).toBe(false);
  });
});

describe("uuidTargetIdSchema (poem and invitation targets)", () => {
  it("accepts a valid UUID", () => {
    expect(uuidTargetIdSchema.safeParse(VALID_UUID).success).toBe(true);
  });

  it("rejects non-UUID values", () => {
    for (const value of [
      "",
      "poem-123",
      "123",
      "123e4567-e89b-12d3-a456-42661417400",
      "123e4567-e89b-12d3-a456-4266141740000",
      VALID_UUID.toUpperCase(),
    ]) {
      expect(uuidTargetIdSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects non-string values", () => {
    expect(uuidTargetIdSchema.safeParse(123).success).toBe(false);
    expect(uuidTargetIdSchema.safeParse(null).success).toBe(false);
  });
});

describe("userTargetIdSchema (Better Auth non-UUID user IDs)", () => {
  it("accepts Better Auth style hex user IDs", () => {
    expect(userTargetIdSchema.safeParse(BETTER_AUTH_USER_ID).success).toBe(true);
  });

  it("accepts URL-safe alphanumeric IDs with dash and underscore", () => {
    for (const value of ["user_123", "some-user", "A-Z_09", "a"]) {
      expect(userTargetIdSchema.safeParse(value).success).toBe(true);
    }
  });

  it("accepts an ID exactly at the maximum length", () => {
    expect(userTargetIdSchema.safeParse("a".repeat(128)).success).toBe(true);
  });

  it("rejects an ID longer than the maximum length", () => {
    expect(userTargetIdSchema.safeParse("a".repeat(129)).success).toBe(false);
  });

  it("rejects an empty ID", () => {
    expect(userTargetIdSchema.safeParse("").success).toBe(false);
  });

  it("rejects IDs with illegal characters", () => {
    for (const value of [
      "user@example",
      "user.name",
      "user+name",
      "user/name",
      "user name",
      "用户",
      "user%name",
    ]) {
      expect(userTargetIdSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects non-string values", () => {
    expect(userTargetIdSchema.safeParse(123).success).toBe(false);
    expect(userTargetIdSchema.safeParse(null).success).toBe(false);
  });
});

describe("invitationCodeSchema", () => {
  it("accepts a URL-safe code at the minimum length", () => {
    expect(
      invitationCodeSchema.safeParse("a".repeat(INVITATION_CODE_MIN_LENGTH))
        .success,
    ).toBe(true);
  });

  it("accepts a URL-safe code at the maximum length", () => {
    expect(
      invitationCodeSchema.safeParse("a".repeat(INVITATION_CODE_MAX_LENGTH))
        .success,
    ).toBe(true);
  });

  it("accepts mixed URL-safe characters", () => {
    const code = `A9_z-${"a".repeat(INVITATION_CODE_MIN_LENGTH - 5)}`;
    expect(invitationCodeSchema.safeParse(code).success).toBe(true);
  });

  it("rejects a code shorter than the minimum length", () => {
    expect(
      invitationCodeSchema.safeParse("a".repeat(INVITATION_CODE_MIN_LENGTH - 1))
        .success,
    ).toBe(false);
  });

  it("rejects a code longer than the maximum length", () => {
    expect(
      invitationCodeSchema.safeParse("a".repeat(INVITATION_CODE_MAX_LENGTH + 1))
        .success,
    ).toBe(false);
  });

  it("rejects codes with non URL-safe characters", () => {
    for (const value of [
      "a+b",
      "a/b",
      "a=b",
      "a b",
      "a.b",
      "%a",
      `a${"=".repeat(INVITATION_CODE_MIN_LENGTH - 1)}`,
    ]) {
      expect(invitationCodeSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects non-string values", () => {
    expect(invitationCodeSchema.safeParse(null).success).toBe(false);
  });
});

describe("maxUsesSchema", () => {
  it("accepts the minimum of 1", () => {
    expect(maxUsesSchema.safeParse(1).success).toBe(true);
  });

  it("accepts the maximum of 100", () => {
    expect(maxUsesSchema.safeParse(INVITATION_MAX_USES_LIMIT).success).toBe(
      true,
    );
  });

  it("coerces numeric strings", () => {
    const result = maxUsesSchema.safeParse("5");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(5);
    }
    expect(
      maxUsesSchema.safeParse(String(INVITATION_MAX_USES_LIMIT)).success,
    ).toBe(true);
  });

  it("rejects values below the minimum", () => {
    for (const value of [0, -1, null]) {
      expect(maxUsesSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects values above the maximum", () => {
    expect(maxUsesSchema.safeParse(INVITATION_MAX_USES_LIMIT + 1).success).toBe(
      false,
    );
  });

  it("rejects non-integers", () => {
    for (const value of [1.5, "1.5"]) {
      expect(maxUsesSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects non-numeric values", () => {
    for (const value of ["abc", "", "  "]) {
      expect(maxUsesSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects NaN and Infinity", () => {
    expect(maxUsesSchema.safeParse(Number.NaN).success).toBe(false);
    expect(maxUsesSchema.safeParse(Number.POSITIVE_INFINITY).success).toBe(
      false,
    );
  });
});

describe("createInvitationInputSchema expiresAt (fixed now)", () => {
  const schema = createInvitationInputSchema(() => FIXED_NOW);

  it("accepts a future expiry", () => {
    const result = schema.safeParse({
      maxUses: 5,
      expiresAt: "2026-08-10T00:00:00.000Z",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.expiresAt.toISOString()).toBe(
        "2026-08-10T00:00:00.000Z",
      );
    }
  });

  it("accepts an expiry exactly 365 days ahead", () => {
    const at365Days = new Date(
      FIXED_NOW.getTime() + INVITATION_MAX_DAYS_AHEAD * DAY_MS,
    ).toISOString();

    expect(schema.safeParse({ maxUses: 5, expiresAt: at365Days }).success).toBe(
      true,
    );
  });

  it("rejects an expiry beyond 365 days", () => {
    const justOver365Days = new Date(
      FIXED_NOW.getTime() + INVITATION_MAX_DAYS_AHEAD * DAY_MS + 1,
    ).toISOString();

    expect(
      schema.safeParse({ maxUses: 5, expiresAt: justOver365Days }).success,
    ).toBe(false);
  });

  it("rejects a past expiry", () => {
    expect(
      schema.safeParse({
        maxUses: 5,
        expiresAt: "2026-07-01T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("rejects an expiry exactly at the current time", () => {
    expect(
      schema.safeParse({ maxUses: 5, expiresAt: FIXED_NOW.toISOString() })
        .success,
    ).toBe(false);
  });

  it("rejects invalid expiry values without throwing", () => {
    for (const value of [
      "not-a-date",
      "",
      "2026-13-45",
      "2026-08-03T99:99:99.000Z",
    ]) {
      expect(
        schema.safeParse({ maxUses: 5, expiresAt: value }).success,
      ).toBe(false);
    }
  });

  it("rejects a non-string expiry", () => {
    expect(schema.safeParse({ maxUses: 5, expiresAt: null }).success).toBe(
      false,
    );
  });

  it("still validates maxUses alongside expiresAt", () => {
    expect(
      schema.safeParse({
        maxUses: 0,
        expiresAt: "2026-08-10T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

describe("moderationPageSchema", () => {
  it("defaults missing input to 1", () => {
    expect(moderationPageSchema.parse(undefined)).toBe(1);
  });

  it("defaults an empty string to 1", () => {
    expect(moderationPageSchema.parse("")).toBe(1);
  });

  it("parses decimal digit strings within range", () => {
    expect(moderationPageSchema.parse("1")).toBe(1);
    expect(moderationPageSchema.parse(String(MODERATION_MAX_PAGE))).toBe(
      MODERATION_MAX_PAGE,
    );
  });

  it("rejects out-of-range and malformed pages", () => {
    for (const value of [
      "0",
      "-1",
      String(MODERATION_MAX_PAGE + 1),
      "abc",
      "1.5",
      " 5",
      "5 ",
      "1e2",
      "0x10",
      null,
    ]) {
      expect(moderationPageSchema.safeParse(value).success).toBe(false);
    }
  });

  it("rejects non-string inputs", () => {
    expect(moderationPageSchema.safeParse(5).success).toBe(false);
  });

  it("rejects arrays", () => {
    for (const value of [[], ["1"], [1], ["1", "2"]]) {
      expect(moderationPageSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("moderationUserListInputSchema", () => {
  it("defaults an explicit undefined page and drops missing filters", () => {
    const result = moderationUserListInputSchema.safeParse({ page: undefined });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1 });
    }
  });

  it("defaults an empty-string page to 1", () => {
    const result = moderationUserListInputSchema.safeParse({ page: "" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1 });
    }
  });

  it("defaults a missing page key", () => {
    expect(moderationUserListInputSchema.parse({})).toEqual({ page: 1 });
  });

  it("accepts every user status enum value", () => {
    for (const status of ["active", "suspended"]) {
      const result = moderationUserListInputSchema.safeParse({
        page: "1",
        status,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(status);
      }
    }
  });

  it("rejects unknown user status values", () => {
    for (const value of ["Active", "banned", "deleted", "active "]) {
      expect(
        moderationUserListInputSchema.safeParse({ page: "1", status: value })
          .success,
      ).toBe(false);
    }
  });

  it("accepts every user role enum value", () => {
    for (const role of ["member", "admin"]) {
      const result = moderationUserListInputSchema.safeParse({
        page: "1",
        role,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe(role);
      }
    }
  });

  it("treats empty GET select values as omitted filters", () => {
    expect(
      moderationUserListInputSchema.parse({
        page: "1",
        role: "",
        status: "suspended",
        q: "",
      }),
    ).toEqual({ page: 1, status: "suspended", q: undefined });
  });

  it("rejects unknown user role values", () => {
    for (const value of ["Member", "owner", "moderator"]) {
      expect(
        moderationUserListInputSchema.safeParse({ page: "1", role: value })
          .success,
      ).toBe(false);
    }
  });

  it("trims the search term", () => {
    const result = moderationUserListInputSchema.safeParse({
      page: "1",
      q: "  杜甫  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("杜甫");
    }
  });

  it("turns blank search terms into undefined", () => {
    for (const q of ["", "   ", "\t\n"]) {
      const result = moderationUserListInputSchema.safeParse({ page: "1", q });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.q).toBeUndefined();
      }
    }
  });

  it("rejects search terms longer than 100 characters", () => {
    expect(
      moderationUserListInputSchema.safeParse({ page: "1", q: "a".repeat(101) })
        .success,
    ).toBe(false);
  });

  it("accepts search terms up to 100 characters after trimming", () => {
    const result = moderationUserListInputSchema.safeParse({
      page: "1",
      q: `  ${"a".repeat(100)}  `,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a non-string search term", () => {
    expect(
      moderationUserListInputSchema.safeParse({ page: "1", q: null }).success,
    ).toBe(false);
  });
});

describe("moderationPoemListInputSchema", () => {
  it("defaults an explicit undefined page and drops missing filters", () => {
    const result = moderationPoemListInputSchema.safeParse({ page: undefined });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1 });
    }
  });

  it("defaults an empty-string page to 1", () => {
    const result = moderationPoemListInputSchema.safeParse({ page: "" });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1 });
    }
  });

  it("defaults a missing page key", () => {
    expect(moderationPoemListInputSchema.parse({})).toEqual({ page: 1 });
  });

  it("accepts every poem status enum value", () => {
    for (const status of ["draft", "published"]) {
      expect(
        moderationPoemListInputSchema.safeParse({ page: "1", status }).success,
      ).toBe(true);
    }
  });

  it("rejects unknown poem status values", () => {
    for (const value of ["archived", "deleted", "Published"]) {
      expect(
        moderationPoemListInputSchema.safeParse({ page: "1", status: value })
          .success,
      ).toBe(false);
    }
  });

  it("accepts every moderation status enum value", () => {
    for (const moderationStatus of ["visible", "hidden"]) {
      expect(
        moderationPoemListInputSchema.safeParse({
          page: "1",
          moderationStatus,
        }).success,
      ).toBe(true);
    }
  });

  it("treats empty poem GET select values as omitted filters", () => {
    expect(
      moderationPoemListInputSchema.parse({
        page: "1",
        status: "",
        moderationStatus: "hidden",
        authorId: "",
        q: "",
      }),
    ).toEqual({ page: 1, moderationStatus: "hidden", q: undefined });
  });

  it("rejects unknown moderation status values", () => {
    for (const value of ["pending", "flagged", "Visible"]) {
      expect(
        moderationPoemListInputSchema.safeParse({
          page: "1",
          moderationStatus: value,
        }).success,
      ).toBe(false);
    }
  });

  it("accepts a valid authorId", () => {
    expect(
      moderationPoemListInputSchema.safeParse({
        page: "1",
        authorId: BETTER_AUTH_USER_ID,
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid authorId", () => {
    expect(
      moderationPoemListInputSchema.safeParse({
        page: "1",
        authorId: "user@example",
      }).success,
    ).toBe(false);
  });

  it("trims the search term", () => {
    const result = moderationPoemListInputSchema.safeParse({
      page: "1",
      q: "  春晓  ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBe("春晓");
    }
  });

  it("turns blank search terms into undefined", () => {
    const result = moderationPoemListInputSchema.safeParse({
      page: "1",
      q: "   ",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.q).toBeUndefined();
    }
  });

  it("rejects search terms longer than 100 characters", () => {
    expect(
      moderationPoemListInputSchema.safeParse({ page: "1", q: "a".repeat(101) })
        .success,
    ).toBe(false);
  });
});

describe("moderation action schemas strip forged fields", () => {
  it("hidePoemInputSchema strips forged fields and trims reason", () => {
    const result = hidePoemInputSchema.safeParse({
      targetId: VALID_UUID,
      reason: "  抄袭  ",
      ...forgedActionFields,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ targetId: VALID_UUID, reason: "抄袭" });
      expect(Object.keys(result.data)).toEqual(["targetId", "reason"]);
    }
  });

  it("restorePoemInputSchema strips forged fields", () => {
    const result = restorePoemInputSchema.safeParse({
      targetId: VALID_UUID,
      reason: "恢复",
      ...forgedActionFields,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ targetId: VALID_UUID, reason: "恢复" });
      expect(Object.keys(result.data)).toEqual(["targetId", "reason"]);
    }
  });

  it("suspendUserInputSchema strips forged fields", () => {
    const result = suspendUserInputSchema.safeParse({
      targetId: BETTER_AUTH_USER_ID,
      reason: "违规",
      ...forgedActionFields,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        targetId: BETTER_AUTH_USER_ID,
        reason: "违规",
      });
      expect(Object.keys(result.data)).toEqual(["targetId", "reason"]);
    }
  });

  it("restoreUserInputSchema strips forged fields", () => {
    const result = restoreUserInputSchema.safeParse({
      targetId: BETTER_AUTH_USER_ID,
      reason: "解除",
      ...forgedActionFields,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        targetId: BETTER_AUTH_USER_ID,
        reason: "解除",
      });
    }
  });

  it("disableInvitationInputSchema strips forged fields", () => {
    const result = disableInvitationInputSchema.safeParse({
      targetId: VALID_UUID,
      reason: "停用",
      ...forgedActionFields,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ targetId: VALID_UUID, reason: "停用" });
      expect(Object.keys(result.data)).toEqual(["targetId", "reason"]);
    }
  });
});

describe("updateUserRoleInputSchema newRole", () => {
  const base = { targetId: BETTER_AUTH_USER_ID, reason: "提升" };

  it("accepts only enum roles and strips forged fields", () => {
    for (const newRole of ["member", "admin"]) {
      const result = updateUserRoleInputSchema.safeParse({
        ...base,
        newRole,
        ...forgedActionFields,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          targetId: base.targetId,
          reason: base.reason,
          newRole,
        });
        expect(Object.keys(result.data)).toEqual([
          "targetId",
          "reason",
          "newRole",
        ]);
      }
    }
  });

  it("rejects non-enum roles", () => {
    for (const newRole of ["superadmin", "owner", "moderator", "Member", ""]) {
      expect(updateUserRoleInputSchema.safeParse({ ...base, newRole }).success)
        .toBe(false);
    }
  });

  it("rejects a missing newRole", () => {
    expect(updateUserRoleInputSchema.safeParse(base).success).toBe(false);
  });
});
