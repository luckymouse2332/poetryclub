/** M6.7 paper journal: shape, spacing, typography and state styling redesigned; upstream structure and public API preserved. */

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Card：子组件、`data-slot` 与组合方式与上游一致
 * （Card / CardHeader / CardTitle / CardDescription / CardAction / CardContent / CardFooter，
 * 内边距由 Header / Content / Footer 与 Card 分担；M6.9 小屏横向 16px，sm 起 24px、lg 起 32px）。
 *
 * 与上游的差异只在类名：映射到 `docs/design-system.md` 的语义 Token，
 * M6.7 使用直角上下边界、Header/Footer 细线与宋体标题，不使用投影。
 * 去掉上游的 `dark:` 变体，保留全部家族结构与组合方式。
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
        "flex min-w-0 flex-col gap-4 rounded-none border-y border-border bg-card py-5 text-card-foreground sm:py-6",
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
        "@container/card-header grid min-w-0 auto-rows-min grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto] items-start gap-3 border-b border-border-subtle px-4 pb-4 sm:px-6 lg:px-8 has-data-[slot=card-action]:grid-cols-[minmax(0,1fr)_auto]",
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
      className={cn("min-w-0 wrap-anywhere font-serif text-body-lg font-semibold leading-heading text-foreground", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-label leading-relaxed text-subtle", className)}
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
    <div data-slot="card-content" className={cn("px-4 sm:px-6 lg:px-8", className)} {...props} />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex flex-wrap items-center gap-3 border-t border-border-subtle px-4 pt-4 sm:px-6 lg:px-8", className)}
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
