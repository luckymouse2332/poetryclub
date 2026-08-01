import type { CurrentUser } from "@/server/auth/session-model";

const EMAIL_LOCAL_PART_MASK = "***";

/**
 * 掩码邮箱本地部分，只保留首字符，避免在导航栏完整暴露邮箱。
 * 非邮箱格式输入一律回退为纯掩码。
 */
export function maskEmail(email: string): string {
  const normalized = email.trim();
  const atIndex = normalized.indexOf("@");

  if (atIndex <= 0 || atIndex >= normalized.length - 1) {
    return EMAIL_LOCAL_PART_MASK;
  }

  const local = normalized.slice(0, atIndex);
  const domain = normalized.slice(atIndex + 1);

  return `${local.charAt(0)}${EMAIL_LOCAL_PART_MASK}@${domain}`;
}

/**
 * 导航与账号页共用的安全显示名：优先使用 trim 后非空的 name，
 * 否则回退到掩码邮箱。
 */
export function getUserDisplayName(
  user: Pick<CurrentUser, "name" | "email">,
): string {
  const trimmedName = user.name.trim();

  if (trimmedName.length > 0) {
    return trimmedName;
  }

  return maskEmail(user.email);
}

const createdAtFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/**
 * 账号创建时间的稳定中文格式（如 2026年8月1日）。
 * 账号页为纯服务端渲染，不存在服务端 / 客户端水合差异。
 */
export function formatCreatedAt(date: Date): string {
  return createdAtFormatter.format(date);
}
