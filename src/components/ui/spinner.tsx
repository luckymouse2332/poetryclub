/** M6.7 paper journal: shape, spacing, typography and state styling redesigned; upstream structure and public API preserved. */

import { Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Spinner：默认对辅助技术暴露 `status` 与可访问名称。
 * Button / IconButton 的加载态由按钮自身的 `aria-busy` 与文案表达，
 * 会显式覆盖为 `aria-hidden`，避免重复播报。
 */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      strokeWidth={1.5}
      role="status"
      aria-label="加载中"
      className={cn(
        "size-4.5 animate-spin text-current motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
