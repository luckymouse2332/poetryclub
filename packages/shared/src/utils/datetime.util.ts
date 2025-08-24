/**
 * 格式化日期为中文格式字符串
 *
 * long' 以获得中文月份全称，如“六月”
 * 。
 * @param date 需要格式化的日期对象
 * @returns 格式化后的日期字符串
 */
// 如需统一格式，可将两者的 'month' 选项保持一致，或根据实际需求分别设置。
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long', // 中文月份全称
    day: 'numeric',
  });
}

/**
 * 格式化日期为数字格式的字符串
 *
 * 使用 'month: 2-digit' 以获得数字格式，如“06”
 *
 * @param date 需要格式化的日期对象
 * @returns 格式化后的日期对象
 */
export function formatDateTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit', // 数字格式月份
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}