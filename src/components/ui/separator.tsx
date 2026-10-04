"use client";

/** M6.7 paper journal: shape, spacing, typography and state styling redesigned; upstream structure and public API preserved. */


import * as React from "react";
import { Separator as SeparatorPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Separator（Radix Separator 无头原语），结构与上游一致，
 * M6.7 定义普通 1px 与章节 2px 分隔，并映射 Token。
 * 默认 `decorative`，不进入辅助技术；章节分隔保留语义。
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      data-decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:data-[decorative=false]:h-0.5 data-[orientation=horizontal]:data-[decorative=false]:bg-border-strong data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
