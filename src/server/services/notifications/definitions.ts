import "server-only";

export const NOTIFICATION_DEFINITIONS = {
  "moderation.poem_hidden": {
    category: "moderation",
    label: "作品治理",
  },
  "moderation.poem_restored": {
    category: "moderation",
    label: "作品治理",
  },
  "moderation.user_suspended": {
    category: "account",
    label: "账号状态",
  },
  "moderation.user_restored": {
    category: "account",
    label: "账号状态",
  },
  "moderation.user_promoted": {
    category: "account",
    label: "权限变更",
  },
  "moderation.user_demoted": {
    category: "account",
    label: "权限变更",
  },
  "system.announcement": {
    category: "system",
    label: "系统公告",
  },
  "comment.created": {
    category: "interaction",
    label: "作品评论",
  },
  "comment.replied": {
    category: "interaction",
    label: "评论回复",
  },
  "moderation.comment_hidden": {
    category: "moderation",
    label: "评论治理",
  },
  "moderation.comment_restored": {
    category: "moderation",
    label: "评论治理",
  },
} as const;

export type KnownNotificationType = keyof typeof NOTIFICATION_DEFINITIONS;

export function getNotificationDefinition(type: string): Readonly<{
  category: string;
  label: string;
}> {
  if (type in NOTIFICATION_DEFINITIONS) {
    return NOTIFICATION_DEFINITIONS[type as KnownNotificationType];
  }
  return { category: "system", label: "站内通知" };
}

export function isKnownNotificationType(
  type: string,
): type is KnownNotificationType {
  return type in NOTIFICATION_DEFINITIONS;
}

export function getNotificationOpenHref(input: {
  type: string;
  targetType: string | null;
  targetId: string | null;
  href: string | null;
}): string | null {
  if (
    input.type === "system.announcement" &&
    input.targetType === "announcement" &&
    input.targetId
  ) {
    return `/announcements/${encodeURIComponent(input.targetId)}`;
  }
  return input.href;
}
