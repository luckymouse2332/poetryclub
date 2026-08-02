import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Card：子组件、`data-slot` 与组合方式与上游一致
 * （Card / CardHeader / CardTitle / CardDescription / CardAction / CardContent / CardFooter，
 * 内边距由 Header / Content / Footer 的 `px-6` 与 Card 的 `py-6` 分担）。
 *
 * 与上游的差异只在类名：映射到 `docs/design-system.md` 的语义 Token，
 * 圆角用设计系统规定的 `--radius-lg`，阴影用 `shadow-card`，
 * 并去掉上游的 `dark:` 变体（设计系统第 12 节第 8 条禁止自动实现深色模式）。
 *
 * 注意：Card 不表达「承载层级」。项目的 Surface（default / paper / muted + 内边距）
 * 是独立的项目组件，见 `src/components/ui/surface.tsx`。
 *
 * 字号类的保留方式与 `field.tsx` 一致，见 `src/lib/utils.ts` 中的 tailwind-merge 说明。
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-lg border border-border-subtle bg-card py-6 text-card-foreground shadow-card",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-semibold text-foreground", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={`text-label ${cn("text-muted-foreground", className)}`}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-6", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
