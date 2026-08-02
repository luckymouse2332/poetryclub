import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Badge，变体按 `docs/design-system.md` 的状态语义定制。
 * Badge 不默认承担按钮行为；需要可交互标签时用 `asChild` 包裹真实可聚焦元素。
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-sm border px-2 py-0.5 text-caption font-medium",
  {
    variants: {
      variant: {
        neutral: "border-border bg-surface-muted text-subtle",
        primary: "border-primary/20 bg-secondary text-secondary-foreground",
        seal: "border-seal/30 bg-seal-surface text-seal-foreground",
        success: "border-success/30 bg-success-surface text-success",
        warning: "border-warning/30 bg-warning-surface text-warning",
        danger: "border-danger/30 bg-danger-surface text-danger",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

function Badge({
  className,
  variant = "neutral",
  asChild = false,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
