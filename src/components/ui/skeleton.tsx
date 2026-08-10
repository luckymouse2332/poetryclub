/**
 * shadcn/ui Skeleton，上游结构与 data-slot 保持不变。
 * 项目差异：占位色使用现有低强调 accent Token。
 */

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  );
}

export { Skeleton };
