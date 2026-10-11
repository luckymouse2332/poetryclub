/** M6.7 paper journal: shape, spacing, typography and state styling redesigned; upstream structure and public API preserved. */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Empty，按设计系统的空状态规范定制。
 * 与上游的差异：EmptyTitle 渲染 `h3` 而非 `div`，保持语义化标题（设计系统第 11 节）。
 * 空状态必须使用真实标题与说明，不得用假业务数据填充。
 *
 * 字号类的保留方式与 `field.tsx` 一致，见该文件说明。
 */
function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex flex-col items-start justify-center gap-5 rounded-none border-y border-border bg-transparent px-0 py-10 text-left",
        className,
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex flex-col items-start gap-3", className)}
      {...props}
    />
  );
}

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "text-muted-foreground [&_svg]:size-8",
        icon: "size-10 border-b border-border bg-transparent text-subtle [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      aria-hidden="true"
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="empty-title"
      className={cn(
        "font-serif text-body-lg font-semibold text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn("max-w-reading text-body text-subtle", className)}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "mt-1 flex flex-row flex-wrap items-center gap-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
};
