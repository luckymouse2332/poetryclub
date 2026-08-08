import { describe, expect, it } from "vitest";

import {
  changePasswordSchema,
  forgotPasswordSchema,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  passwordSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/features/auth/validation";

describe("password validation", () => {
  it("uses one length policy for registration, change, and reset", () => {
    expect(passwordSchema.safeParse("x".repeat(PASSWORD_MIN_LENGTH - 1)).success).toBe(
      false,
    );
    expect(passwordSchema.safeParse("x".repeat(PASSWORD_MIN_LENGTH)).success).toBe(
      true,
    );
    expect(passwordSchema.safeParse("x".repeat(PASSWORD_MAX_LENGTH + 1)).success).toBe(
      false,
    );

    const commonPassword = "x".repeat(PASSWORD_MIN_LENGTH);
    expect(
      signUpSchema.safeParse({
        name: "测试成员",
        email: "member@example.test",
        password: commonPassword,
        inviteCode: "a".repeat(32),
      }).success,
    ).toBe(true);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: commonPassword,
        newPassword: commonPassword,
        confirmNewPassword: commonPassword,
      }).success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({
        newPassword: commonPassword,
        confirmNewPassword: commonPassword,
      }).success,
    ).toBe(true);
  });

  it("rejects mismatched confirmation before an auth request is sent", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "password123",
      newPassword: "new-password-123",
      confirmNewPassword: "different-password-123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmNewPassword).toEqual([
        "两次输入的新密码不一致",
      ]);
    }
  });

  it("normalizes forgot-password email before submission", () => {
    expect(
      forgotPasswordSchema.parse({ email: "  MEMBER@Example.TEST  " }),
    ).toEqual({ email: "member@example.test" });
  });
});
