"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Surface } from "@/components/ui/surface";
import { Textarea } from "@/components/ui/textarea";
import {
  INITIAL_ANNOUNCEMENT_ACTION_STATE,
  type AnnouncementActionState,
} from "@/features/notifications/announcement-action-state";
import {
  ANNOUNCEMENT_BODY_MAX_LENGTH,
  ANNOUNCEMENT_TITLE_MAX_LENGTH,
  type AnnouncementAudience,
} from "@/server/validation/notifications";

export type AnnouncementFormAction = (
  state: AnnouncementActionState,
  formData: FormData,
) => Promise<AnnouncementActionState>;

type AnnouncementFormProps = Readonly<{
  action: AnnouncementFormAction;
  submitLabel: string;
  initialValues?: Readonly<{
    title: string;
    body: string;
    href: string;
    audience: AnnouncementAudience;
  }>;
}>;

const AUDIENCES = [
  {
    value: "all_accounts",
    title: "全部账号",
    description: "包括正常账号和已禁用账号。",
  },
  {
    value: "active_accounts",
    title: "全部正常账号",
    description: "包括正常成员和正常管理员。",
  },
  {
    value: "active_members",
    title: "正常成员",
    description: "仅发送给 role=member 且 status=active 的账号。",
  },
  {
    value: "active_admins",
    title: "正常管理员",
    description: "仅发送给 role=admin 且 status=active 的账号。",
  },
] as const satisfies ReadonlyArray<{
  value: AnnouncementAudience;
  title: string;
  description: string;
}>;

export function AnnouncementForm({
  action,
  submitLabel,
  initialValues,
}: AnnouncementFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_ANNOUNCEMENT_ACTION_STATE,
  );

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
          className={
            state.status === "error"
              ? "rounded-md border border-danger bg-danger-surface p-3 text-label text-danger"
              : "rounded-md border border-success bg-success-surface p-3 text-label text-success"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Surface variant="paper" padding="lg" className="space-y-6">
        <FormField
          id="title"
          label="公告标题"
          required
          disabled={pending}
          error={state.fieldErrors?.title}
        >
          {(props) => (
            <Input
              {...props}
              name="title"
              maxLength={ANNOUNCEMENT_TITLE_MAX_LENGTH}
              defaultValue={initialValues?.title}
            />
          )}
        </FormField>

        <FormField
          id="body"
          label="公告正文"
          description="以纯文本发布，换行会原样保留。发布后不可修改。"
          required
          disabled={pending}
          error={state.fieldErrors?.body}
        >
          {(props) => (
            <Textarea
              {...props}
              name="body"
              rows={10}
              maxLength={ANNOUNCEMENT_BODY_MAX_LENGTH}
              defaultValue={initialValues?.body}
            />
          )}
        </FormField>

        <FormField
          id="href"
          label="站内链接"
          description="可选，只允许以 / 开头的站内相对路径，例如 /about。"
          disabled={pending}
          error={state.fieldErrors?.href}
        >
          {(props) => (
            <Input
              {...props}
              name="href"
              placeholder="/about"
              defaultValue={initialValues?.href}
            />
          )}
        </FormField>

        <FieldSet data-invalid={Boolean(state.fieldErrors?.audience)}>
          <FieldLegend variant="label">
            发布受众 <span className="text-danger">*</span>
          </FieldLegend>
          <FieldDescription id="announcement-audience-description">
            受众在发布时生成快照，之后新注册或状态变化的账号不会补收该公告。
          </FieldDescription>
          <RadioGroup
            name="audience"
            defaultValue={initialValues?.audience ?? "active_accounts"}
            disabled={pending}
            aria-describedby="announcement-audience-description"
            aria-invalid={Boolean(state.fieldErrors?.audience)}
          >
            {AUDIENCES.map((item) => (
              <Field key={item.value} orientation="horizontal" className="items-start">
                <RadioGroupItem
                  id={`announcement-audience-${item.value}`}
                  value={item.value}
                  aria-label={item.title}
                />
                <FieldContent>
                  <FieldLabel htmlFor={`announcement-audience-${item.value}`}>
                    <FieldTitle>{item.title}</FieldTitle>
                    <FieldDescription>{item.description}</FieldDescription>
                  </FieldLabel>
                </FieldContent>
              </Field>
            ))}
          </RadioGroup>
          {state.fieldErrors?.audience ? (
            <FieldError>{state.fieldErrors.audience}</FieldError>
          ) : null}
        </FieldSet>
      </Surface>

      <Button type="submit" loading={pending}>
        {pending ? "正在保存…" : submitLabel}
      </Button>
    </form>
  );
}
