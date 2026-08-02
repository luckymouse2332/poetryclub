import * as React from "react";

import { cn } from "@/lib/utils";
import { inputBaseClasses } from "./input";

export type TextareaProps = React.ComponentProps<"textarea">;

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(inputBaseClasses, "min-h-24 py-2", className)}
      {...props}
    />
  );
}

export { Textarea };
