"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { authClient } from "@/features/auth/auth-client";
import { signInSchema, signUpSchema } from "@/features/auth/validation";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = Readonly<{
  initialMode?: AuthMode;
  nextPath?: string;
}>;

export function AuthForm({
  initialMode = "sign-in",
  nextPath = "/",
}: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setNotice(undefined);

    const formData = new FormData(event.currentTarget);
    const input = {
      email: formData.get("email"),
      password: formData.get("password"),
      ...(mode === "sign-up" ? { name: formData.get("name") } : {}),
    };
    setPending(true);

    try {
      let response;

      if (mode === "sign-up") {
        const result = signUpSchema.safeParse(input);
        if (!result.success) {
          setError(result.error.issues[0]?.message ?? "请检查输入内容");
          return;
        }
        response = await authClient.signUp.email(result.data);
      } else {
        const result = signInSchema.safeParse(input);
        if (!result.success) {
          setError(result.error.issues[0]?.message ?? "请检查输入内容");
          return;
        }
        response = await authClient.signIn.email(result.data);
      }

      if (response.error) {
        setError("操作失败，请检查输入后重试。");
        return;
      }

      if (mode === "sign-up") {
        setMode("sign-in");
        setNotice("注册请求已完成，请使用邮箱和密码登录。");
        return;
      }

      router.replace(getSafeRedirectPath(nextPath));
      router.refresh();
    } catch {
      setError("暂时无法连接服务器，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(undefined);
    setNotice(undefined);
  }

  return (
    <Surface className="w-full" aria-label="认证表单">
      <div
        className="grid grid-cols-2 gap-1 rounded-md bg-surface-muted p-1"
        role="tablist"
        aria-label="选择登录或注册"
      >
        <Button
          type="button"
          variant="ghost"
          role="tab"
          aria-selected={mode === "sign-in"}
          aria-controls="auth-form-panel"
          onClick={() => switchMode("sign-in")}
          disabled={pending}
          className="w-full aria-selected:bg-paper aria-selected:text-foreground aria-selected:shadow-card"
        >
          登录
        </Button>
        <Button
          type="button"
          variant="ghost"
          role="tab"
          aria-selected={mode === "sign-up"}
          aria-controls="auth-form-panel"
          onClick={() => switchMode("sign-up")}
          disabled={pending}
          className="w-full aria-selected:bg-paper aria-selected:text-foreground aria-selected:shadow-card"
        >
          注册
        </Button>
      </div>

      <form
        id="auth-form-panel"
        className="mt-6 space-y-5"
        onSubmit={handleSubmit}
        noValidate
      >
        {mode === "sign-up" ? (
          <FormField id="name" label="昵称" required disabled={pending}>
            {(controlProps) => (
              <Input
                {...controlProps}
                name="name"
                type="text"
                autoComplete="name"
                maxLength={50}
              />
            )}
          </FormField>
        ) : null}

        <FormField id="email" label="邮箱" required disabled={pending}>
          {(controlProps) => (
            <Input
              {...controlProps}
              name="email"
              type="email"
              autoComplete="email"
            />
          )}
        </FormField>

        <FormField
          id="password"
          label="密码"
          description={mode === "sign-up" ? "请使用至少 8 个字符。" : undefined}
          required
          disabled={pending}
        >
          {(controlProps) => (
            <Input
              {...controlProps}
              name="password"
              type="password"
              autoComplete={
                mode === "sign-up" ? "new-password" : "current-password"
              }
              minLength={8}
              maxLength={128}
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

        {notice ? (
          <p
            className="rounded-md border border-success bg-success-surface p-3 text-label text-success"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        <Button className="w-full" type="submit" loading={pending}>
          {pending ? "处理中…" : mode === "sign-up" ? "创建账号" : "登录"}
        </Button>
      </form>
    </Surface>
  );
}
