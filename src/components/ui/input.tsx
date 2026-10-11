/** M6.7 paper journal: shape, spacing, typography and state styling redesigned; upstream structure and public API preserved. */

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Input：保留上游 data-slot，Input / Textarea 共用纸面、2px 圆角与独立焦点外框，
 * 错误态由 `aria-invalid` 驱动，不只依赖颜色。
 */
export const inputBaseClasses = cn(
  "w-full min-w-0 rounded-md border border-input bg-paper px-3.5 text-body text-foreground transition-colors placeholder:text-muted-foreground hover:border-primary focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground aria-invalid:border-danger aria-invalid:bg-paper aria-invalid:focus-visible:outline-danger",
);

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
