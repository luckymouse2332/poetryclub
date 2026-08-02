import * as React from "react";

import { cn } from "@/lib/utils";

export const inputBaseClasses =
  "w-full rounded-md border border-input bg-paper px-3 text-body text-foreground placeholder:text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground aria-invalid:border-danger aria-invalid:bg-danger-surface";

export type InputProps = React.ComponentProps<"input">;

function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(inputBaseClasses, "h-control", className)}
      {...props}
    />
  );
}

export { Input };
