"use client";

import { useActionState, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { createInvitationAction } from "@/features/moderation/actions";
import type { AdminActionState } from "@/features/moderation/actions";
import {
  INVITATION_MAX_DAYS_AHEAD,
  INVITATION_MAX_USES_LIMIT,
} from "@/server/validation/moderation";

const INITIAL_STATE: AdminActionState = { status: "idle" };

/**
 * 创建邀请码表单（Client Component）。提交成功时，明文邀请码只在本次
 * action state 中出现一次，并提示立即复制；关闭或重新提交后不再可见。
 * 列表页绝不显示 code/hash。
 */
export function InvitationCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createInvitationAction,
    INITIAL_STATE,
  );
  const [copied, setCopied] = useState(false);

  const code = state.status === "success" ? state.invitationCode : undefined;

  const copyCode = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // 剪贴板不可用时仍然展示明文，管理员可手动复制。
      setCopied(false);
    }
  };

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && state.message ? (
        <Alert variant="danger" role="alert">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      {state.status === "success" && code ? (
        <Alert variant="success" role="status">
          <AlertDescription>
            <p className="text-label text-success">{state.message}</p>
            <p className="mt-3 border border-input bg-paper px-3 py-2 font-mono text-body break-all text-foreground">
              {code}
            </p>
            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={copyCode}
              >
                {copied ? "已复制" : "复制邀请码"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <Surface variant="paper" padding="lg" className="space-y-6">
        <FormField
          id="maxUses"
          label="可用次数"
          description={`最多可使用 ${INVITATION_MAX_USES_LIMIT} 次；注册成功才消耗一次。`}
          required
          disabled={isPending}
          error={state.fieldErrors?.maxUses}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              name="maxUses"
              type="number"
              inputMode="numeric"
              min={1}
              max={INVITATION_MAX_USES_LIMIT}
              defaultValue={1}
            />
          )}
        </FormField>

        <FormField
          id="expiresAt"
          label="过期时间"
          description={`请选择未来 ${INVITATION_MAX_DAYS_AHEAD} 天内的日期时间，过期后邀请码自动失效。`}
          required
          disabled={isPending}
          error={state.fieldErrors?.expiresAt}
        >
          {(controlProps) => (
            <Input {...controlProps} name="expiresAt" type="datetime-local" />
          )}
        </FormField>
      </Surface>

      <Button type="submit" className="w-full sm:w-auto" loading={isPending}>
        {isPending ? "正在创建…" : "创建邀请码"}
      </Button>
    </form>
  );
}
