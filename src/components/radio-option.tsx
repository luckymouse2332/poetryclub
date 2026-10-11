import type { ComponentProps, ReactNode } from "react";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroupItem } from "@/components/ui/radio-group";

/** 不是上游组件：既有 Field/RadioGroupItem 的带说明选项组合，保留原语键盘行为。 */
export function RadioOption({
  id,
  value,
  title,
  description,
  ...props
}: Omit<
  ComponentProps<typeof RadioGroupItem>,
  "id" | "value" | "title" | "children"
> & {
  id: string;
  value: string;
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <Field
      orientation="horizontal"
      className="items-start border-l-2 border-l-transparent px-3 py-4 transition-colors has-[[data-state=checked]]:border-l-primary has-[[data-state=checked]]:bg-accent [&>[data-slot=radio-group-item]]:mt-1"
    >
      <RadioGroupItem id={id} value={value} {...props} />
      <FieldContent>
        <FieldLabel htmlFor={id}>
          <FieldTitle>{title}</FieldTitle>
          <FieldDescription>{description}</FieldDescription>
        </FieldLabel>
      </FieldContent>
    </Field>
  );
}
