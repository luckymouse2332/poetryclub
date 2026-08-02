import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 Tailwind 类名。
 *
 * 已知限制：项目在 `@theme` 中自定义的字号类（text-display / text-page-title /
 * text-section-title / text-body-lg / text-body / text-label / text-caption）不在
 * tailwind-merge 的默认字号表内，会被识别成文字颜色类，因此与 `text-*` 颜色类
 * 出现在同一次合并中时会被丢弃。当前组件按既有渲染结果保留这一行为，
 * 需要保住字号的地方使用未合并的前缀（见 `src/components/ui/field.tsx`）。
 * 后续可用 `extendTailwindMerge` 注册上述字号，届时需重新核对受影响组件的实际字号。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
