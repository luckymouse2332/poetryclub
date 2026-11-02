/**
 * 评论功能的共享边界常量。同时被服务端校验/查询与客户端表单使用，
 * 因此放在 `src/lib`，Client Component 不得导入 `src/server` 模块。
 */
export const COMMENT_BODY_MAX_LENGTH = 2000;
export const COMMENT_ROOT_PAGE_SIZE = 10;
export const COMMENT_REPLY_PREVIEW_SIZE = 3;
export const COMMENT_REPLY_PAGE_SIZE = 20;
export const COMMENT_PUBLISH_COOLDOWN_SECONDS = 10;
