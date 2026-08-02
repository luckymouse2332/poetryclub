"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Label（Radix Label 无头原语），样式按设计系统的表单标签定义。
 * disabled 态由 FormField 显式换用弱化文字色，不使用降低透明度的写法。
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn("text-label font-medium text-foreground", className)}
      {...props}
    />
  );
}

export { Label };
