import type { TransactionalEmail } from "@/server/email/types";

export const RESET_LINK_EXPIRES_IN_MINUTES = 60;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function createPasswordResetEmail(input: Readonly<{
  to: string;
  fromAddress: string;
  resetUrl: string;
}>): TransactionalEmail {
  const safeUrl = escapeHtml(input.resetUrl);
  const subject = "重置你的回中诗社密码";
  const text = [
    "你好：",
    "",
    "我们收到了重置回中诗社账户密码的请求。请使用下面的链接设置新密码：",
    input.resetUrl,
    "",
    `该链接将在 ${RESET_LINK_EXPIRES_IN_MINUTES} 分钟后失效，并且只能使用一次。`,
    "如果这不是你的操作，可以忽略这封邮件；你的密码不会被修改。",
  ].join("\n");
  const html = `<!doctype html><html lang="zh-CN"><body style="margin:0;background:#f5efe3;color:#332c26;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"><main style="max-width:600px;margin:0 auto;padding:40px 24px"><div style="border:1px solid #d8cbb9;background:#fffaf0;border-radius:12px;padding:32px"><p style="margin:0 0 20px;font-size:14px;color:#7a6554">回中诗社</p><h1 style="margin:0 0 20px;font-size:24px">重置账户密码</h1><p style="line-height:1.7">我们收到了重置回中诗社账户密码的请求。请点击下面的按钮设置新密码。</p><p style="margin:28px 0"><a href="${safeUrl}" style="display:inline-block;border-radius:8px;background:#8d2f2f;color:#fff;text-decoration:none;padding:12px 20px">设置新密码</a></p><p style="line-height:1.7">该链接将在 ${RESET_LINK_EXPIRES_IN_MINUTES} 分钟后失效，并且只能使用一次。</p><p style="line-height:1.7;color:#6e6258">如果这不是你的操作，可以忽略这封邮件；你的密码不会被修改。</p></div></main></body></html>`;

  return {
    to: input.to,
    from: `回中诗社 <${input.fromAddress}>`,
    subject,
    text,
    html,
  };
}
