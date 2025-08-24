/**
 * 判断一个值是否为纯JS对象
 *
 * 防止该值是数组、null或Date类型
 *
 * 严格版：仅认为具有 Object.prototype 的对象为 plain object（不包含 Object.create(null)）
 *
 * @param val 要判断的值
 * @returns 是否为纯JS对象
 */
export function isPlainObject(val: any): val is Record<string, any> {
  if (typeof val !== 'object' || val === null) return false;
  if (Array.isArray(val)) return false;
  if (val instanceof Date) return false;
  return Object.getPrototypeOf(val) === Object.prototype;
}
