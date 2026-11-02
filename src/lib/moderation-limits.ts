/**
 * 治理与邀请码功能的共享边界常量。同时被服务端校验/查询与客户端
 * 管理表单使用，因此放在 `src/lib`，Client Component 不得导入
 * `src/server` 模块。
 */
export const MODERATION_PAGE_SIZE = 20;
export const MODERATION_MAX_PAGE = 10000;
export const MODERATION_REASON_MAX_LENGTH = 500;
export const INVITATION_CODE_MIN_LENGTH = 32;
export const INVITATION_CODE_MAX_LENGTH = 128;
export const INVITATION_MAX_USES_LIMIT = 100;
export const INVITATION_MAX_DAYS_AHEAD = 365;
