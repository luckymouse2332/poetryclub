import { renderTransactionalEmail } from "@/server/email/template";
import type { TransactionalEmail } from "@/server/email/types";

export const RESET_LINK_EXPIRES_IN_MINUTES = 60;

export function createPasswordResetEmail(
  input: Readonly<{
    to: string;
    fromAddress: string;
    resetUrl: string;
  }>,
): TransactionalEmail {
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
  const html = renderTransactionalEmail({
    title: "重置账户密码",
    intro: "我们收到了重置回中诗社账户密码的请求。请点击下面的按钮设置新密码。",
    action: { href: input.resetUrl, label: "设置新密码" },
    expiry: `该链接将在 ${RESET_LINK_EXPIRES_IN_MINUTES} 分钟后失效，并且只能使用一次。`,
    note: "如果这不是你的操作，可以忽略这封邮件；你的密码不会被修改。",
  });

  return {
    to: input.to,
    from: `回中诗社 <${input.fromAddress}>`,
    subject,
    text,
    html,
  };
}
