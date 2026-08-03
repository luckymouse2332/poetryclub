import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display",
        "page-title",
        "section-title",
        "body-lg",
        "body",
        "label",
        "caption",
      ],
    },
  },
});

/**
 * 合并 Tailwind 类名。
 *
 * 项目在 `@theme` 中定义的字号已注册到 tailwind-merge 的 `text` 主题，
 * 因此 `text-label` 等字号类可与 `text-primary-foreground` 等文字颜色类共存，
 * 同一组字号类仍按后出现者覆盖。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
