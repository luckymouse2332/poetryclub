/**
 * 诗作展示与表单共用的纯格式化工具（不访问数据库）。
 *
 * 时区约定：`occurredAt` 由服务端校验以 UTC 00:00 存入 `timestamp`（无时区）列，
 * 回填 date-only 值时统一使用 UTC getter，避免部署服务器时区改变日期。
 */

const fullDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/** 完整日期展示（如 2026年8月2日），供列表卡片、详情页与表单元数据使用。 */
export function formatPoemDate(date: Date): string {
  return fullDateFormatter.format(date);
}

/** 把 `Date` 格式化为 `type="date"` 输入框需要的 YYYY-MM-DD 值。 */
export function toDateInputValue(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
