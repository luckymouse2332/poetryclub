import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: ["page", "section", "control"],
      container: ["content", "reading", "narrow"],
      leading: ["title", "heading", "copy", "reading", "compact"],
      shadow: ["card", "floating", "focus"],
      radius: ["floating"],
      ease: ["enter", "exit"],
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
    classGroups: {
      z: [{ z: ["floating", "header", "sheet"] }],
      duration: [{ duration: ["fast", "normal", "slow"] }],
    },
  },
});

/**
 * 合并 Tailwind 类名。
 *
 * 项目的字号、间距、宽度、行高与浮层 Token 均注册到对应组。
 * 字号与文字颜色可共存；同组后出现的类覆盖默认值，例如
 * Section 的 py-0 覆盖 py-section、窄容器覆盖 max-w-content。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
