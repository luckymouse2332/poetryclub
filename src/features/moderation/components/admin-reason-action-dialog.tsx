"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  type AdminActionState,
} from "@/features/moderation/actions";
import { MODERATION_REASON_MAX_LENGTH } from "@/server/validation/moderation";

export type AdminReasonAction = (
  state: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

// 本地初始状态：actions.ts 是 "use server" 文件，其值导出不能跨进 Client
// Component（Next 限制），类型导出不受影响。此常量与 INITIAL_ADMIN_ACTION_STATE 等价。
const INITIAL_STATE: AdminActionState = { status: "idle" };

type AdminReasonActionDialogProps = Readonly<{
  /** 已通过 bind 绑定 targetId 的管理 Action；表单只提交 reason 字段。 */
  action: AdminReasonAction;
  triggerLabel: string;
  triggerVariant?: NonNullable<ButtonProps["variant"]>;
  confirmVariant?: NonNullable<ButtonProps["variant"]>;
  title: string;
  description: string;
  confirmLabel: string;
  confirmBusyLabel: string;
  reasonDescription?: string;
}>;

/**
 * 管理操作二次确认对话框（Client Component）：隐藏 / 恢复、禁用 / 恢复用户、
 * 角色变更与停用邀请码统一复用。Dialog 内必须填写纯文本原因（maxLength 500），
 * `useActionState` 展示字段级与整体错误，pending 期间通过 fieldset 禁用全部
 * 控件防止重复提交。恢复与降级等管理变更同样视为危险操作，必须二次确认。
 */
export function AdminReasonActionDialog({
  action,
  triggerLabel,
  triggerVariant = "danger",
  confirmVariant = "danger",
  title,
  description,
  confirmLabel,
  confirmBusyLabel,
  reasonDescription,
}: AdminReasonActionDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={triggerVariant} size="sm">
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      {open ? (
        <AdminReasonDialogContent
          action={action}
          onClose={() => setOpen(false)}
          confirmVariant={confirmVariant}
          title={title}
          description={description}
          confirmLabel={confirmLabel}
          confirmBusyLabel={confirmBusyLabel}
          reasonDescription={reasonDescription}
        />
      ) : null}
    </AlertDialog>
  );
}

type AdminReasonDialogContentProps = Readonly<{
  action: AdminReasonAction;
  onClose: () => void;
  confirmVariant: NonNullable<ButtonProps["variant"]>;
  title: string;
  description: string;
  confirmLabel: string;
  confirmBusyLabel: string;
  reasonDescription?: string;
}>;

function AdminReasonDialogContent({
  action,
  onClose,
  confirmVariant,
  title,
  description,
  confirmLabel,
  confirmBusyLabel,
  reasonDescription,
}: AdminReasonDialogContentProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_STATE,
  );

  // 成功即关闭：服务端已 revalidate 对应列表，卡片状态随后刷新。
  useEffect(() => {
    if (state.status === "success") {
      onClose();
    }
  }, [state.status, onClose]);

  const fieldError = state.fieldErrors?.reason;

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <form action={formAction} className="space-y-4">
        {state.status === "error" && state.message ? (
          <p
            role="alert"
            aria-live="polite"
            className="rounded-md border border-danger bg-danger-surface p-3 text-label text-danger"
          >
            {state.message}
          </p>
        ) : null}
        <fieldset disabled={isPending} className="space-y-4">
          <FormField
            id="reason"
            label="原因"
            required
            disabled={isPending}
            description={reasonDescription}
            error={fieldError}
          >
            {(controlProps) => (
              <Textarea
                {...controlProps}
                name="reason"
                rows={3}
                maxLength={MODERATION_REASON_MAX_LENGTH}
                placeholder="请填写本次操作的说明"
              />
            )}
          </FormField>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <Button
              type="submit"
              variant={confirmVariant}
              loading={isPending}
            >
              {isPending ? confirmBusyLabel : confirmLabel}
            </Button>
          </AlertDialogFooter>
        </fieldset>
      </form>
    </AlertDialogContent>
  );
}
