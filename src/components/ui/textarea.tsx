/** M6.7 paper journal: shape, spacing, typography and state styling redesigned; upstream structure and public API preserved. */

import * as React from "react";

import { inputBaseClasses } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** shadcn/ui Textarea：保留 data-slot，以共用输入 Token 和垂直调整尺寸适配项目。 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(inputBaseClasses, "min-h-32 resize-y px-4 py-4 leading-reading", className)}
      {...props}
    />
  );
}

export { Textarea };
