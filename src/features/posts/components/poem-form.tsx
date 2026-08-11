"use client";

import { useActionState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import type { PoemActionState } from "@/features/posts/actions";
import {
  BODY_MAX_LENGTH,
  CONTEXT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  type PoemVisibility,
} from "@/server/validation/poems";

export type PoemFormAction = (
  state: PoemActionState,
  formData: FormData,
) => Promise<PoemActionState>;

type PoemFormProps = Readonly<{
  action: PoemFormAction;
  submitLabel: string;
  /** 仅新建草稿时传入，作为幂等键的 hidden 字段；编辑时保持 undefined。 */
  creationToken?: string;
  /** 编辑回填的初始值：最小字符串 props，不回传数据库实体或作者信息。 */
  initialValues?: Readonly<{
    title?: string;
    body?: string;
    context?: string;
    occurredAt?: string;
    visibility?: PoemVisibility;
  }>;
}>;

const INITIAL_STATE: PoemActionState = { status: "idle" };

/**
 * 诗作表单（Client Component）。通过 `useActionState` 接收由页面传入的
 * Server Action（`createPoemAction` 或 `updatePoemAction.bind(null, id)`）。
 * 纯文本正文、普通 `<textarea>`，不做富文本。
 */
export function PoemForm({
  action,
  submitLabel,
  creationToken,
  initialValues,
}: PoemFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_STATE,
  );
  const displayedValues = state.values ?? initialValues;

  return (
    <form action={formAction} className="space-y-6">
      {creationToken ? (
        <input type="hidden" name="creationToken" value={creationToken} />
      ) : null}

      {state.status === "error" && state.message ? (
        <Alert variant="danger" role="alert">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div
        key={state.revision ?? 0}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(17rem,0.8fr)]"
      >
        <Surface variant="paper" padding="lg" className="space-y-6">
          <FormField
            id="title"
            label="标题"
            required
            disabled={isPending}
            error={state.fieldErrors?.title}
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                name="title"
                type="text"
                maxLength={TITLE_MAX_LENGTH}
                defaultValue={displayedValues?.title}
              />
            )}
          </FormField>

          <FormField
            id="body"
            label="正文"
            description="普通文本，换行与空行会被原样保留。"
            required
            disabled={isPending}
            error={state.fieldErrors?.body}
          >
            {(controlProps) => (
              <Textarea
                {...controlProps}
                name="body"
                rows={22}
                maxLength={BODY_MAX_LENGTH}
                defaultValue={displayedValues?.body}
                className="min-h-[30rem] resize-y font-serif text-body-lg leading-reading"
              />
            )}
          </FormField>
        </Surface>

        <div className="space-y-4 lg:sticky lg:top-8">
          <Surface variant="paper" padding="lg" className="space-y-6">
            <FormField
              id="context"
              label="创作背景"
              description="可选，写给读者的背景说明。"
              disabled={isPending}
              error={state.fieldErrors?.context}
            >
              {(controlProps) => (
                <Textarea
                  {...controlProps}
                  name="context"
                  rows={6}
                  maxLength={CONTEXT_MAX_LENGTH}
                  defaultValue={displayedValues?.context}
                />
              )}
            </FormField>

            <FormField
              id="occurredAt"
              label="事件日期"
              description="可选，作品对应的创作或事件日期。"
              disabled={isPending}
              error={state.fieldErrors?.occurredAt}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  name="occurredAt"
                  type="date"
                  defaultValue={displayedValues?.occurredAt}
                />
              )}
            </FormField>

            <FieldSet data-invalid={Boolean(state.fieldErrors?.visibility)}>
          <FieldLegend variant="label">
            访问范围 <span className="text-danger">*</span>
          </FieldLegend>
          <FieldDescription id="visibility-description">
            公开作品无需登录即可阅读；仅成员可见作品只对正常成员和管理员开放。
          </FieldDescription>
          <RadioGroup
            name="visibility"
            defaultValue={
              displayedValues?.visibility === "public" ||
              displayedValues?.visibility === "members_only"
                ? displayedValues.visibility
                : undefined
            }
            disabled={isPending}
            aria-describedby="visibility-description"
            aria-invalid={Boolean(state.fieldErrors?.visibility)}
          >
            <Field orientation="horizontal" className="items-start">
              <RadioGroupItem
                value="public"
                id="visibility-public"
                aria-label="公开"
              />
              <FieldContent>
                <FieldLabel htmlFor="visibility-public">
                  <FieldTitle>公开</FieldTitle>
                  <FieldDescription>
                    游客、正常成员和管理员都可以阅读。
                  </FieldDescription>
                </FieldLabel>
              </FieldContent>
            </Field>
            <Field orientation="horizontal" className="items-start">
              <RadioGroupItem
                value="members_only"
                id="visibility-members"
                aria-label="仅成员可见"
              />
              <FieldContent>
                <FieldLabel htmlFor="visibility-members">
                  <FieldTitle>仅成员可见</FieldTitle>
                  <FieldDescription>
                    只有正常成员和管理员可以阅读。
                  </FieldDescription>
                </FieldLabel>
              </FieldContent>
            </Field>
          </RadioGroup>
          {state.fieldErrors?.visibility ? (
            <FieldError>{state.fieldErrors.visibility}</FieldError>
          ) : null}
            </FieldSet>
          </Surface>

          <Button type="submit" className="w-full" loading={isPending}>
            {isPending ? "正在保存…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
