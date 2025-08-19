import { clsx } from 'clsx';

/**
 * 合并并返回多个类名字符串，支持条件渲染和数组嵌套等多种输入格式。
 * 
 * This function combines multiple class name inputs into a single string,
 * supporting conditional rendering and nested arrays, leveraging the `clsx` utility.
 *
 * @param inputs - 需要合并的类名，可以是字符串、数组或对象等多种格式。
 * @returns 合并后的类名字符串。
 */
export function cn(...inputs: Parameters<typeof clsx>) {
  return clsx(...inputs);
}