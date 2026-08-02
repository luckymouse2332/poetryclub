import * as React from "react";

import { cn } from "@/lib/utils";

export type FormFieldControlProps = {
  id: string;
  required?: boolean;
  disabled?: boolean;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

export type FormFieldProps = {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  children: (props: FormFieldControlProps) => React.ReactNode;
};

function FormField({
  id,
  label,
  description,
  required = false,
  error,
  disabled = false,
  className,
  children,
}: FormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className={cn(
          "text-label font-medium text-foreground",
          disabled && "text-muted-foreground",
        )}
      >
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children({
        id,
        required: required || undefined,
        disabled: disabled || undefined,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}
      {description ? (
        <p id={descriptionId} className="text-caption text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-label text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FormField };
