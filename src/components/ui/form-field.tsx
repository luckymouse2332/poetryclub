import * as React from "react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

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

/**
 * 在 shadcn/ui Field 之上统一生成 label、description、required、error、disabled
 * 与 `aria-describedby` 关系，避免各表单各写一套无障碍关联。
 */
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
    <Field className={className}>
      <FieldLabel
        htmlFor={id}
        className={disabled ? "text-muted-foreground" : undefined}
      >
        {label}
        {required ? (
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </FieldLabel>
      {children({
        id,
        required: required || undefined,
        disabled: disabled || undefined,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy,
      })}
      {description ? (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      ) : null}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </Field>
  );
}

export { FormField };
