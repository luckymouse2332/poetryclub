import type { TransactionalEmail } from "@/server/email/types";

export type EmailOtpPurpose = "sign-in" | "email-verification" | "forget-password" | "change-email";

const PURPOSE_LABEL: Record<EmailOtpPurpose, string> = {
  "sign-in": "登录",
  "email-verification": "验证邮箱",
  "forget-password": "重置密码",
  "change-email": "更换邮箱",
};

export const EMAIL_OTP_EXPIRES_IN_MINUTES = 5;

export function createEmailOtpMessage(input: Readonly<{
  to: string;
  fromAddress: string;
  otp: string;
  type: EmailOtpPurpose;
}>): TransactionalEmail {
  const purpose = PURPOSE_LABEL[input.type];
  const code = input.otp.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const subject = `回中诗社${purpose}验证码`;
  const text = [
    "你好：",
    "",
    `你的回中诗社${purpose}验证码是：${input.otp}`,
    `验证码将在 ${EMAIL_OTP_EXPIRES_IN_MINUTES} 分钟后失效，只能使用一次。`,
    "如果这不是你的操作，可以忽略这封邮件。",
  ].join("\n");
  const html = `<!doctype html><html lang="zh-CN"><body style="margin:0;background:#f5efe3;color:#332c26;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><main style="max-width:600px;margin:0 auto;padding:40px 24px"><div style="border:1px solid #d8cbb9;background:#fffaf0;border-radius:12px;padding:32px"><p style="margin:0 0 20px;font-size:14px;color:#7a6554">回中诗社</p><h1 style="margin:0 0 20px;font-size:24px">${purpose}验证码</h1><p style="line-height:1.7">请在页面输入下面的验证码：</p><p style="font-size:32px;font-weight:700;letter-spacing:0.2em">${code}</p><p style="line-height:1.7">验证码将在 ${EMAIL_OTP_EXPIRES_IN_MINUTES} 分钟后失效，只能使用一次。</p><p style="line-height:1.7;color:#6e6258">如果这不是你的操作，可以忽略这封邮件。</p></div></main></body></html>`;
  return { to: input.to, from: `回中诗社 <${input.fromAddress}>`, subject, text, html };
}
