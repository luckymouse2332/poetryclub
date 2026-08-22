export const COMMENT_ERROR_MESSAGES = {
  not_found: "作品或评论不存在。",
  login_required: "请登录后再操作。",
  forbidden: "你没有执行此操作的权限。",
  invalid_depth: "当前版本只支持一级回复。",
  invalid_transition: "评论状态已变化，请刷新后重试。",
  idempotency_conflict: "提交标识已被其他内容使用，请刷新后重试。",
  rate_limited: "发布得有些快，请在十秒后重试。",
  invalid_cursor: "评论位置已失效，请刷新后重试。",
} as const;

export type CommentErrorCode = keyof typeof COMMENT_ERROR_MESSAGES;

export function getCommentErrorMessage(code: CommentErrorCode): string {
  return COMMENT_ERROR_MESSAGES[code];
}
