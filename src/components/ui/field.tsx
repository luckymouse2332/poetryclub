"use client";

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
 * 1. 纵向 Field 沿用项目既有的 `space-y-1.5` 垂直节奏，而不是上游的 `flex flex-col gap-3`；
 *    改为上游节奏会把表单行距从 0.375rem 拉到 0.75rem，属于视觉变更，需要单独的设计任务。
 *    因此 label 仍是行内元素、必填星号紧跟标签文字。
 * 2. 字号与颜色映射到设计系统 Token，并去掉上游的 `dark:` 变体。
 *
 * 注意：`text-caption` / `text-label` 等项目自定义字号类会被 tailwind-merge
 * 误判为文字颜色类，与 `text-*` 颜色类一起经过 `cn()` 会被丢弃（见 `src/lib/utils.ts`）。
 * 说明与错误文案因此保留未合并的字号前缀，维持既有字号。
 */
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn("flex flex-col gap-6", className)}
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
        "mb-3 font-medium text-foreground",
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
        "group/field-group flex w-full flex-col gap-6 [&>[data-slot=field-group]]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva("group/field w-full data-[invalid=true]:text-danger", {
  variants: {
    orientation: {
      vertical: "space-y-1.5",
      horizontal:
        "flex flex-row items-center gap-3 [&>[data-slot=field-label]]:flex-auto",
    },
  },
  defaultVariants: {
    orientation: "vertical",
  },
});

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
        "group/field-content flex flex-1 flex-col gap-1.5",
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
  return <Label data-slot="field-label" className={className} {...props} />;
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      className={`text-label ${cn("flex w-fit items-center gap-2 font-medium text-foreground", className)}`}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={`text-caption ${cn("text-muted-foreground", className)}`}
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
          className="text-caption relative mx-auto block w-fit bg-surface px-2 text-muted-foreground"
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
      className={`text-label ${cn("text-danger", className)}`}
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
