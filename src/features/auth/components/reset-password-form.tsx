"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { authClient } from "@/features/auth/auth-client";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  resetPasswordSchema,
} from "@/features/auth/validation";

type ResetPasswordFormProps = Readonly<{
  token: string;
}>;

type FieldErrors = Partial<
  Record<"newPassword" | "confirmNewPassword", string>
>;

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const [tokenUsable, setTokenUsable] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tokenUsable) return;
    setFieldErrors({});
    setError(undefined);

    const formData = new FormData(event.currentTarget);
    const result = resetPasswordSchema.safeParse({
      newPassword: formData.get("newPassword"),
      confirmNewPassword: formData.get("confirmNewPassword"),
    });
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      setFieldErrors({
        newPassword: flattened.newPassword?.[0],
        confirmNewPassword: flattened.confirmNewPassword?.[0],
      });
      return;
    }

    setPending(true);
    try {
      const response = await authClient.resetPassword({
        newPassword: result.data.newPassword,
        token,
      });

      if (response.error) {
        if (response.error.status === 429) {
          setError("尝试次数过多，请稍后再试。");
        } else if (
          response.error.code === "INVALID_TOKEN" ||
          response.error.code === "TOKEN_EXPIRED"
        ) {
          setTokenUsable(false);
          setError("这个重置链接无效、已过期或已经使用，请重新申请。");
        } else if (response.error.code === "PASSWORD_TOO_SHORT") {
          setFieldErrors({
            newPassword: `密码至少需要 ${PASSWORD_MIN_LENGTH} 个字符`,
          });
        } else if (response.error.code === "PASSWORD_TOO_LONG") {
          setFieldErrors({
            newPassword: `密码不能超过 ${PASSWORD_MAX_LENGTH} 个字符`,
          });
        } else {
          setError("暂时无法重置密码，请稍后重试。");
        }
        return;
      }

      setTokenUsable(false);
      router.replace("/login?passwordReset=success");
      router.refresh();
    } catch {
      setError("暂时无法连接服务器，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <Surface className="w-full" aria-label="重置密码表单">
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <FormField
          id="newPassword"
          label="新密码"
          description={`请使用 ${PASSWORD_MIN_LENGTH} 至 ${PASSWORD_MAX_LENGTH} 个字符。`}
          error={fieldErrors.newPassword}
          required
          disabled={pending || !tokenUsable}
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
          disabled={pending || !tokenUsable}
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
          <p
            className="rounded-md border border-danger bg-danger-surface p-3 text-label text-danger"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        ) : null}

        <Button
          className="w-full"
          type="submit"
          loading={pending}
          disabled={pending || !tokenUsable}
        >
          {pending ? "正在重置…" : "设置新密码"}
        </Button>
      </form>
    </Surface>
  );
}
