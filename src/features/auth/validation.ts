import { z } from "zod";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/password-policy.mjs";
export { resetPasswordTokenSchema } from "@/lib/reset-token";

export { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/password-policy.mjs";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("请输入有效的邮箱地址");

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `密码至少需要 ${PASSWORD_MIN_LENGTH} 个字符`)
  .max(PASSWORD_MAX_LENGTH, `密码不能超过 ${PASSWORD_MAX_LENGTH} 个字符`);

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = signInSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "请输入昵称")
    .max(50, "昵称不能超过 50 个字符"),
  inviteCode: z
    .string()
    .trim()
    .min(32, "请输入有效的邀请码")
    .max(128, "请输入有效的邀请码")
    .regex(/^[A-Za-z0-9_-]+$/, "请输入有效的邀请码"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "请输入当前密码"),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "请再次输入新密码"),
  })
  .superRefine((input, context) => {
    if (input.newPassword !== input.confirmNewPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "两次输入的新密码不一致",
      });
    }
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "请再次输入新密码"),
  })
  .superRefine((input, context) => {
    if (input.newPassword !== input.confirmNewPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmNewPassword"],
        message: "两次输入的新密码不一致",
      });
    }
  });
