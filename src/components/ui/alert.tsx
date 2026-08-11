import * as React from "react";
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * shadcn/ui Alert，保留上游组合结构并增加项目 success / warning / danger 变体。
 * Alert 本身不默认创建 live region；调用方按动态状态显式设置 role。
 */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-md border px-4 py-3 text-label has-[>svg]:grid-cols-[1rem_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "border-border-strong bg-paper text-foreground",
        success: "border-success/30 bg-success-surface text-success",
        warning: "border-warning/30 bg-warning-surface text-warning",
        danger: "border-danger/30 bg-danger-surface text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

const STATUS_ICONS = {
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
} satisfies Partial<Record<AlertVariant, React.ComponentType<React.ComponentProps<"svg">>>>;

function Alert({
  className,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const resolvedVariant = variant ?? "default";
  const Icon =
    resolvedVariant === "default" ? null : STATUS_ICONS[resolvedVariant];

  return (
    <div
      data-slot="alert"
      data-variant={resolvedVariant}
      className={cn(alertVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {Icon ? <Icon aria-hidden="true" /> : null}
      {children}
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 min-h-4 font-medium tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-label text-current [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
