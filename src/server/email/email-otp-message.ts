import { renderTransactionalEmail } from "@/server/email/template";
import type { TransactionalEmail } from "@/server/email/types";

export type EmailOtpPurpose =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

const PURPOSE_LABEL: Record<EmailOtpPurpose, string> = {
  "sign-in": "登录",
  "email-verification": "验证邮箱",
  "forget-password": "重置密码",
  "change-email": "更换邮箱",
};

export const EMAIL_OTP_EXPIRES_IN_MINUTES = 5;

export function createEmailOtpMessage(
  input: Readonly<{
    to: string;
    fromAddress: string;
    otp: string;
    type: EmailOtpPurpose;
  }>,
): TransactionalEmail {
  const purpose = PURPOSE_LABEL[input.type];
  const subject = `回中诗社${purpose}验证码`;
  const text = [
    "你好：",
    "",
    `你的回中诗社${purpose}验证码是：${input.otp}`,
    `验证码将在 ${EMAIL_OTP_EXPIRES_IN_MINUTES} 分钟后失效，只能使用一次。`,
    "如果这不是你的操作，可以忽略这封邮件。",
  ].join("\n");
  const html = renderTransactionalEmail({
    title: `${purpose}验证码`,
    intro: "请在页面输入下面的验证码：",
    code: input.otp,
    expiry: `验证码将在 ${EMAIL_OTP_EXPIRES_IN_MINUTES} 分钟后失效，只能使用一次。`,
    note: "如果这不是你的操作，可以忽略这封邮件。",
  });
  return {
    to: input.to,
    from: `回中诗社 <${input.fromAddress}>`,
    subject,
    text,
    html,
  };
}
