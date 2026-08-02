import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Input / Textarea 共用的表面样式：Paper 背景、统一边框与圆角，
 * 错误态由 `aria-invalid` 驱动，不只依赖颜色。
 */
export const inputBaseClasses =
  "w-full rounded-md border border-input bg-paper px-3 text-body text-foreground placeholder:text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground aria-invalid:border-danger aria-invalid:bg-danger-surface";

function Input({
  className,
  type = "text",
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputBaseClasses, "h-control", className)}
      {...props}
    />
  );
}

export { Input };
