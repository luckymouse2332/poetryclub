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

function firstGrapheme(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) return null;

  if (typeof Intl.Segmenter === "function") {
    const segments = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    }).segment(normalized);
    const first = segments[Symbol.iterator]().next();
    if (!first.done) return first.value.segment;
  }

  return Array.from(normalized)[0] ?? null;
}

/**
 * 移动端账户入口只展示一个 Unicode 字素：优先显示名称，空名称回退邮箱。
 * Intl.Segmenter 能保留组合字符和 emoji 字素；旧环境按 Unicode code point 回退。
 */
export function getUserInitial(
  user: Pick<CurrentUser, "name" | "email">,
): string {
  return firstGrapheme(user.name) ?? firstGrapheme(user.email) ?? "";
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
