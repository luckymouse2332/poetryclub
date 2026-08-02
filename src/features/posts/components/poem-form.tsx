"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { Textarea } from "@/components/ui/textarea";
import type { PoemActionState } from "@/features/posts/actions";
import {
  BODY_MAX_LENGTH,
  CONTEXT_MAX_LENGTH,
  TITLE_MAX_LENGTH,
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

  return (
    <form action={formAction} className="space-y-6">
      {creationToken ? (
        <input type="hidden" name="creationToken" value={creationToken} />
      ) : null}

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-md border border-danger bg-danger-surface p-3 text-label text-danger"
        >
          {state.message}
        </p>
      ) : null}

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
              defaultValue={initialValues?.title}
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
              rows={14}
              maxLength={BODY_MAX_LENGTH}
              defaultValue={initialValues?.body}
            />
          )}
        </FormField>

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
              rows={4}
              maxLength={CONTEXT_MAX_LENGTH}
              defaultValue={initialValues?.context}
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
              defaultValue={initialValues?.occurredAt}
            />
          )}
        </FormField>
      </Surface>

      <Button type="submit" className="w-full sm:w-auto" loading={isPending}>
        {isPending ? "正在保存…" : submitLabel}
      </Button>
    </form>
  );
}
