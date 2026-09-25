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
import type { CollectionActionState } from "@/features/collections/actions";
import { useUnsavedFormGuard } from "@/lib/use-unsaved-form-guard";
import {
  COLLECTION_DESCRIPTION_MAX_LENGTH,
  COLLECTION_TITLE_MAX_LENGTH,
  type CollectionVisibility,
} from "@/server/validation/collections";

export type CollectionFormAction = (
  state: CollectionActionState,
  formData: FormData,
) => Promise<CollectionActionState>;

type CollectionFormProps = Readonly<{
  action: CollectionFormAction;
  submitLabel: string;
  canPublish?: boolean;
  creationToken?: string;
  initialValues?: Readonly<{
    title?: string;
    description?: string;
    visibility?: CollectionVisibility;
  }>;
}>;

const INITIAL_STATE: CollectionActionState = { status: "idle" };

export function CollectionForm({
  action,
  submitLabel,
  canPublish = false,
  creationToken,
  initialValues,
}: CollectionFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_STATE);
  const displayedValues = state.values ?? initialValues;
  const { dirty, markDirty } = useUnsavedFormGuard();

  return (
    <form action={formAction} onInput={markDirty} onChange={markDirty} data-unsaved-editor={dirty ? "true" : undefined} className="space-y-6">
      {creationToken ? (
        <input type="hidden" name="creationToken" value={creationToken} />
      ) : null}
      {state.status === "error" && state.message ? (
        <Alert variant="danger" role="alert">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {dirty ? (
        <Alert variant="warning" role="status">
          <AlertDescription>有未保存的修改。离开页面或执行状态操作前，请先保存。</AlertDescription>
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
                maxLength={COLLECTION_TITLE_MAX_LENGTH}
                defaultValue={displayedValues?.title}
              />
            )}
          </FormField>
          <FormField
            id="description"
            label="简介"
            description="可选，使用普通文本说明这一组作品的主题和编排缘由。"
            disabled={isPending}
            error={state.fieldErrors?.description}
          >
            {(controlProps) => (
              <Textarea
                {...controlProps}
                name="description"
                rows={12}
                maxLength={COLLECTION_DESCRIPTION_MAX_LENGTH}
                defaultValue={displayedValues?.description}
                className="min-h-56 resize-y"
              />
            )}
          </FormField>
        </Surface>

        <div className="space-y-4 lg:sticky lg:top-8">
          <Surface variant="paper" padding="lg">
            <FieldSet data-invalid={Boolean(state.fieldErrors?.visibility)}>
              <FieldLegend variant="label">
                访问范围 <span className="text-danger">*</span>
              </FieldLegend>
              <FieldDescription id="collection-visibility-description">
                公开特辑只能收录公开诗作；仅成员特辑可以收录成员作品。
              </FieldDescription>
              <RadioGroup
                name="visibility"
                defaultValue={displayedValues?.visibility}
                disabled={isPending}
                aria-describedby="collection-visibility-description"
                aria-invalid={Boolean(state.fieldErrors?.visibility)}
              >
                <Field orientation="horizontal" className="items-start">
                  <RadioGroupItem value="public" id="visibility-public" />
                  <FieldContent>
                    <FieldLabel htmlFor="visibility-public">
                      <FieldTitle>公开</FieldTitle>
                      <FieldDescription>游客也可以阅读。</FieldDescription>
                    </FieldLabel>
                  </FieldContent>
                </Field>
                <Field orientation="horizontal" className="items-start">
                  <RadioGroupItem
                    value="members_only"
                    id="visibility-members"
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="visibility-members">
                      <FieldTitle>仅成员可见</FieldTitle>
                      <FieldDescription>
                        只对正常成员和管理员开放。
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
          <div className="space-y-2">
            <Button type="submit" name="intent" value="save" className="w-full" loading={isPending}>
              {isPending ? "正在处理…" : submitLabel}
            </Button>
            {canPublish ? (
              <Button type="submit" name="intent" value="publish" variant="secondary" className="w-full" disabled={isPending}>
                保存并发布特辑
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
