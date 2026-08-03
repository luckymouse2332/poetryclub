import { z } from "zod";

// These constraints mirror Better Auth's server configuration. The server
// remains authoritative; this schema only provides immediate form feedback.
const email = z.string().trim().email("请输入有效的邮箱地址");
const password = z
  .string()
  .min(8, "密码至少需要 8 个字符")
  .max(128, "密码不能超过 128 个字符");

export const signInSchema = z.object({
  email,
  password,
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
