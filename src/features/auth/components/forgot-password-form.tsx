"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { authClient } from "@/features/auth/auth-client";
import { forgotPasswordSchema } from "@/features/auth/validation";

const UNIFORM_SUCCESS_MESSAGE =
  "如果该邮箱已注册，我们会发送一封密码重置邮件。";

export function ForgotPasswordForm() {
  const [emailError, setEmailError] = useState<string>();
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setEmailError(undefined);
    setError(undefined);
    setSubmitted(false);

    const result = forgotPasswordSchema.safeParse({
      email: new FormData(form).get("email"),
    });
    if (!result.success) {
      setEmailError(result.error.flatten().fieldErrors.email?.[0]);
      return;
    }

    setPending(true);
    try {
      const response = await authClient.requestPasswordReset({
        email: result.data.email,
        redirectTo: "/reset-password",
      });

      if (response.error) {
        if (response.error.status === 429) {
          setError("请求次数过多，请稍后再试。");
        } else {
          setError("暂时无法提交请求，请稍后重试。");
        }
        return;
      }

      form.reset();
      setSubmitted(true);
    } catch {
      setError("暂时无法连接服务器，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <Surface className="w-full" aria-label="忘记密码表单">
      {submitted ? (
        <div className="space-y-5">
          <p
            className="rounded-md border border-success bg-success-surface p-4 text-body text-success"
            role="status"
          >
            {UNIFORM_SUCCESS_MESSAGE}
          </p>
          <Button asChild variant="secondary" className="w-full">
            <Link href="/login">返回登录</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <FormField
            id="email"
            label="邮箱"
            description="请输入注册时使用的邮箱。"
            error={emailError}
            required
            disabled={pending}
          >
            {(controlProps) => (
              <Input
                {...controlProps}
                name="email"
                type="email"
                autoComplete="email"
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

          <Button className="w-full" type="submit" loading={pending} disabled={pending}>
            {pending ? "正在提交…" : "发送重置邮件"}
          </Button>
          <p className="text-center text-label text-subtle">
            <Link className="text-link" href="/login">
              返回登录
            </Link>
          </p>
        </form>
      )}
    </Surface>
  );
}
