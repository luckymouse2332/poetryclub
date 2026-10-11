/** M6.7 paper journal / CHORE-4: semantic styles and a cva list variant;
 * upstream family, data-slot and cn override conventions preserved.
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Card：子组件、`data-slot` 与组合方式与上游一致
 * （Card / CardHeader / CardTitle / CardDescription / CardAction / CardContent / CardFooter，
 * 内边距由 Header / Content / Footer 与 Card 分担；M6.9 小屏横向 16px，sm 起 24px、lg 起 32px）。
 *
 * 与上游的差异：类名映射到语义 Token，增加 default/list 变体，
 * M6.7 使用直角上下边界、Header/Footer 细线与宋体标题，不使用投影。
 * 去掉上游的 `dark:` 变体，保留全部家族结构与组合方式。
 *
 * 注意：Card 不表达「承载层级」。项目的 Surface（default / paper / muted + 内边距）
 * 是独立的项目组件，见 `src/components/ui/surface.tsx`。
 *
 * 字号类的保留方式与 `field.tsx` 一致，见 `src/lib/utils.ts` 中的 tailwind-merge 说明。
 */
// CHORE-4: list rows retain upstream slots; the named group supplies section styling.
const cardVariants = cva(
  "group/card flex min-w-0 flex-col gap-4 rounded-none py-5 text-card-foreground sm:py-6",
  {
    variants: {
      variant: {
        default: "border-y border-border bg-card",
        list: "border-0 bg-transparent shadow-none",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Card({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid min-w-0 auto-rows-min grid-cols-[minmax(0,1fr)] grid-rows-[auto_auto] items-start gap-3 border-b border-border-subtle px-4 pb-4 has-data-[slot=card-action]:grid-cols-[minmax(0,1fr)_auto] sm:px-6 lg:px-8",
        "group-data-[variant=list]/card:border-b-0 group-data-[variant=list]/card:pb-0",
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
      className={cn(
        "min-w-0 font-serif text-body-lg leading-heading font-semibold wrap-anywhere text-foreground",
        className,
      )}
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
    <div
      data-slot="card-content"
      className={cn("px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex flex-wrap items-center gap-3 border-t border-border-subtle px-4 pt-4 group-data-[variant=list]/card:gap-2 group-data-[variant=list]/card:border-t-0 group-data-[variant=list]/card:pt-0 sm:px-6 lg:px-8",
        className,
      )}
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
