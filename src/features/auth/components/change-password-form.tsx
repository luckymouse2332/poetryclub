"use client";

import { type FormEvent, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { authClient } from "@/features/auth/auth-client";
import {
  changePasswordSchema,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/features/auth/validation";

type ChangePasswordField =
  | "currentPassword"
  | "newPassword"
  | "confirmNewPassword";

type FieldErrors = Partial<Record<ChangePasswordField, string>>;

export function ChangePasswordForm() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setFieldErrors({});
    setError(undefined);
    setNotice(undefined);

    const formData = new FormData(form);
    const result = changePasswordSchema.safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmNewPassword: formData.get("confirmNewPassword"),
    });

    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      setFieldErrors({
        currentPassword: flattened.currentPassword?.[0],
        newPassword: flattened.newPassword?.[0],
        confirmNewPassword: flattened.confirmNewPassword?.[0],
      });
      return;
    }

    setPending(true);
    try {
      const response = await authClient.changePassword({
        currentPassword: result.data.currentPassword,
        newPassword: result.data.newPassword,
        revokeOtherSessions: true,
      });

      if (response.error) {
        if (response.error.status === 429) {
          setError("尝试次数过多，请稍后再修改密码。");
        } else if (response.error.code === "INVALID_PASSWORD") {
          setFieldErrors({ currentPassword: "当前密码不正确" });
        } else if (response.error.code === "PASSWORD_TOO_SHORT") {
          setFieldErrors({
            newPassword: `密码至少需要 ${PASSWORD_MIN_LENGTH} 个字符`,
          });
        } else if (response.error.code === "PASSWORD_TOO_LONG") {
          setFieldErrors({
            newPassword: `密码不能超过 ${PASSWORD_MAX_LENGTH} 个字符`,
          });
        } else if (
          response.error.status === 401 ||
          response.error.code === "SESSION_EXPIRED"
        ) {
          setError("当前登录状态已失效，请重新登录后再试。");
        } else {
          setError("暂时无法修改密码，请稍后重试。");
        }
        return;
      }

      form.reset();
      setNotice("密码已更新，其他已登录设备的会话已经撤销。");
    } catch {
      setError("暂时无法连接服务器，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <Surface variant="paper" aria-label="修改密码表单">
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <FormField
          id="currentPassword"
          label="当前密码"
          error={fieldErrors.currentPassword}
          required
          disabled={pending}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              name="currentPassword"
              type="password"
              autoComplete="current-password"
            />
          )}
        </FormField>

        <FormField
          id="newPassword"
          label="新密码"
          description={`请使用 ${PASSWORD_MIN_LENGTH} 至 ${PASSWORD_MAX_LENGTH} 个字符。`}
          error={fieldErrors.newPassword}
          required
          disabled={pending}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
            />
          )}
        </FormField>

        <FormField
          id="confirmNewPassword"
          label="确认新密码"
          error={fieldErrors.confirmNewPassword}
          required
          disabled={pending}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              name="confirmNewPassword"
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
            />
          )}
        </FormField>

        {error ? (
          <Alert variant="danger" role="alert">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {notice ? (
          <Alert variant="success" role="status">
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        ) : null}

        <Button type="submit" loading={pending} disabled={pending}>
          {pending ? "正在更新…" : "更新密码"}
        </Button>
      </form>
    </Surface>
  );
}
