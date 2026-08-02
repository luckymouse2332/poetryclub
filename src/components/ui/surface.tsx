import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

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

function Surface({ className, variant, padding, ...props }: SurfaceProps) {
  return (
    <div
      className={cn(surfaceVariants({ variant, padding, className }))}
      {...props}
    />
  );
}

export { Surface, surfaceVariants };
