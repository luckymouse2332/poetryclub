import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Surface 是**项目组件**，不是 shadcn 上游组件。
 *
 * 它承担 `docs/design-system.md` 第 10 节定义的「承载层级」角色：
 * 只表达 default / paper / muted 三种层级与统一内边距，不制造业务语义。
 * 上游 shadcn 没有等价物——上游 `Card` 是固定样式的结构化卡片（见 `card.tsx`），
 * 没有层级变体，且把内边距分散到 CardHeader / CardContent / CardFooter，
 * 与本项目「整块表面 + 统一 padding」的用法不同，因此两者并存而不是互相替代。
 */
const surfaceVariants = cva("rounded-lg border text-foreground", {
  variants: {
    variant: {
      default: "border-border-subtle bg-surface shadow-card",
      paper: "border-border-subtle bg-paper shadow-card",
      muted: "border-border bg-surface-muted",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

export type SurfaceProps = React.ComponentProps<"div"> &
  VariantProps<typeof surfaceVariants>;

function Surface({
  className,
  variant = "default",
  padding = "md",
  ...props
}: SurfaceProps) {
  return (
    <div
      data-slot="surface"
      data-variant={variant}
      className={cn(surfaceVariants({ variant, padding, className }))}
      {...props}
    />
  );
}

export { Surface, surfaceVariants };
