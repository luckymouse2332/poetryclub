"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/features/auth/auth-client";
import { signInSchema, signUpSchema } from "@/features/auth/validation";

type AuthMode = "sign-in" | "sign-up";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
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

      router.replace("/");
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
    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <div className="grid grid-cols-2 rounded-lg bg-muted p-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sign-in"}
          onClick={() => switchMode("sign-in")}
          className="rounded-md px-3 py-2 text-sm font-medium aria-selected:bg-background aria-selected:shadow-sm"
        >
          登录
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sign-up"}
          onClick={() => switchMode("sign-up")}
          className="rounded-md px-3 py-2 text-sm font-medium aria-selected:bg-background aria-selected:shadow-sm"
        >
          注册
        </button>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
        {mode === "sign-up" ? (
          <label className="block text-sm font-medium">
            昵称
            <input
              className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={50}
              required
            />
          </label>
        ) : null}

        <label className="block text-sm font-medium">
          邮箱
          <input
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className="block text-sm font-medium">
          密码
          <input
            className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            name="password"
            type="password"
            autoComplete={
              mode === "sign-up" ? "new-password" : "current-password"
            }
            minLength={8}
            maxLength={128}
            required
          />
        </label>

        {error ? (
          <p className="text-sm text-destructive" role="alert" aria-live="polite">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="text-sm text-muted-foreground" role="status">
            {notice}
          </p>
        ) : null}

        <Button className="w-full" type="submit" disabled={pending}>
          {pending ? "处理中…" : mode === "sign-up" ? "创建账号" : "登录"}
        </Button>
      </form>
    </div>
  );
}
