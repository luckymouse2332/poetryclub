import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

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
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
