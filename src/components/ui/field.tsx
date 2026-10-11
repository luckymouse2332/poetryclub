"use client";

/** M6.7 paper journal: shape, spacing, typography and state styling redesigned; upstream structure and public API preserved. */

import * as React from "react";
import { useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui Field 家族：导出与上游一致
 * （FieldSet / FieldLegend / FieldGroup / Field / FieldContent / FieldLabel /
 * FieldTitle / FieldDescription / FieldSeparator / FieldError），
 * `data-slot`、`role` 与 `errors` 去重逻辑照搬上游。
 *
 * 与上游的差异：
 * 1. M6.7 将纵向字段改为 flex/gap-2；分组标题加细线，说明与错误独立排版。
 *    标签保持必填标记的关联，单选标签的标题与说明纵向排列。
 * 2. 字号与颜色映射到设计系统 Token，并去掉上游的 `dark:` 变体。
 *
 * 项目字号已注册进 `src/lib/utils.ts` 的 tailwind-merge 配置，
 * 因此 `text-caption` / `text-label` 可与语义文字颜色类安全共存。
 */
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-8", className)}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-4 w-full border-b border-border pb-3 font-medium text-foreground",
        "data-[variant=legend]:text-body",
        "data-[variant=label]:text-label",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group flex w-full flex-col gap-8 [&>[data-slot=field-group]]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  "group/field w-full data-[invalid=true]:text-danger",
  {
    variants: {
      orientation: {
        vertical: "flex flex-col gap-2",
        horizontal:
          "flex flex-row items-start gap-3 [&>[data-slot=field-label]]:flex-auto",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation, className }))}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex min-w-0 flex-1 flex-col gap-2",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "flex flex-wrap items-baseline gap-1.5 has-[>[data-slot=field-title]]:flex-col has-[>[data-slot=field-title]]:items-start",
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      className={cn(
        "flex w-fit items-center gap-2 text-label font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        "text-label leading-relaxed font-normal text-subtle",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      data-content={Boolean(children)}
      className={cn("relative -my-2 h-5", className)}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children ? (
        <span
          data-slot="field-separator-content"
          className="relative mx-auto block w-fit bg-surface px-2 text-caption text-muted-foreground"
        >
          {children}
        </span>
      ) : null}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  if (!content) {
    return null;
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn(
        "border-l-2 border-danger pl-3 text-label leading-relaxed text-danger",
        className,
      )}
      {...props}
    >
      {content}
    </div>
  );
}

export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  fieldVariants,
};
