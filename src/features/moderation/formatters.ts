/**
 * 管理模块共用的纯格式化与文案映射（不访问数据库，仅由 Server Components 使用）。
 * 时间统一使用 zh-CN 稳定格式；所有输出在服务端完成，不存在水合差异。
 */

const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const dateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** 日期 + 时间（如 2026年8月3日 14:05），用于审计、邀请码等需要时刻的记录。 */
export function formatModerationDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

/** 仅日期（如 2026年8月3日），用于诗作、用户等列表卡片。 */
export function formatModerationDate(date: Date): string {
  return dateFormatter.format(date);
}

export const ROLE_LABELS = {
  member: "成员",
  admin: "管理员",
} as const;

export const USER_STATUS_LABELS = {
  active: "正常",
  suspended: "已禁用",
} as const;

export const POEM_STATUS_LABELS = {
  draft: "草稿",
  published: "已发布",
} as const;

export const MODERATION_STATUS_LABELS = {
  visible: "可见",
  hidden: "已隐藏",
} as const;

export const AUDIT_ACTION_LABELS = {
  poem_hidden: "隐藏诗作",
  poem_restored: "恢复诗作",
  user_suspended: "禁用用户",
  user_restored: "恢复用户",
  user_promoted: "提升管理员",
  user_demoted: "降级成员",
  invitation_created: "创建邀请码",
  invitation_disabled: "停用邀请码",
  announcement_created: "创建公告草稿",
  announcement_updated: "更新公告草稿",
  announcement_published: "发布系统公告",
  comment_hidden: "隐藏评论",
  comment_restored: "恢复评论",
} as const;

export const AUDIT_TARGET_LABELS = {
  poem: "诗作",
  user: "用户",
  invitation: "邀请码",
  announcement: "系统公告",
  comment: "评论",
} as const;
