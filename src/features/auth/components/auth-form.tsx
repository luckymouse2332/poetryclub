"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Surface } from "@/components/ui/surface";
import { AuthErrorPopover } from "@/features/auth/components/auth-error-popover";
import { EmailCodeForm } from "@/features/auth/components/email-code-form";
import {
  authClient,
  registerWithInvitation,
} from "@/features/auth/auth-client";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  signInSchema,
  signUpSchema,
} from "@/features/auth/validation";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

type AuthMode = "sign-in" | "sign-up";
type SignInMethod = "password" | "email-code";

type AuthFormProps = Readonly<{
  initialMode?: AuthMode;
  nextPath?: string;
  initialNotice?: string;
  cleanPasswordResetNotice?: boolean;
  variant?: "switchable" | "sign-in-only";
  embedded?: boolean;
}>;

export function AuthForm({
  initialMode = "sign-in",
  nextPath = "/",
  initialNotice,
  cleanPasswordResetNotice = false,
  variant = "switchable",
  embedded = false,
}: AuthFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(
    variant === "sign-in-only" ? "sign-in" : initialMode,
  );
  const [error, setError] = useState<string>();
  const [errorOpen, setErrorOpen] = useState(false);
  const [notice, setNotice] = useState<string | undefined>(initialNotice);
  const [pending, setPending] = useState(false);
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("password");
  const [verificationEmail, setVerificationEmail] = useState<string>();
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (!cleanPasswordResetNotice) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("passwordReset");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [cleanPasswordResetNotice]);

  function showError(message: string) {
    setError(message);
    setErrorOpen(true);
  }

  function finishSignIn() {
    router.replace(getSafeRedirectPath(nextPath));
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setErrorOpen(false);
    setNotice(undefined);

    const formData = new FormData(event.currentTarget);
    const input = {
      email: formData.get("email"),
      password: formData.get("password"),
      ...(mode === "sign-up"
        ? {
            name: formData.get("name"),
            inviteCode: formData.get("inviteCode"),
          }
        : {}),
    };
    setPending(true);

    try {
      if (mode === "sign-up") {
        const result = signUpSchema.safeParse(input);
        if (!result.success) {
          showError(result.error.issues[0]?.message ?? "请检查输入内容");
          return;
        }
        const response = await registerWithInvitation(result.data);
        if (response.error) {
          showError("注册未完成，请检查邀请码与输入内容后重试。");
          return;
        }
        setVerificationEmail(result.data.email);
        setVerificationSent(true);
        return;
      }
      const result = signInSchema.safeParse(input);
      if (!result.success) {
        showError(result.error.issues[0]?.message ?? "请检查输入内容");
        return;
      }
      const response = await authClient.signIn.email(result.data);
      if (response.error?.code === "EMAIL_NOT_VERIFIED") {
        setVerificationEmail(result.data.email);
        setVerificationSent(false);
        return;
      }
      if (response.error) {
        showError(response.error.status === 429 ? "尝试次数过多，请稍后再登录。" : "邮箱或密码不正确，请检查后重试。");
        return;
      }
      finishSignIn();
    } catch {
      showError("暂时无法连接服务器，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(undefined);
    setErrorOpen(false);
    setNotice(undefined);
    setVerificationEmail(undefined);
    setVerificationSent(false);
    setSignInMethod("password");
  }

  const content = (
    <>
      {variant === "switchable" ? (
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
      ) : null}

      <div id="auth-form-panel" className={variant === "switchable" ? "mt-6 space-y-5" : "space-y-5"}>
        {mode === "sign-in" && !verificationEmail ? (
          <div className="grid grid-cols-2 gap-2" aria-label="登录方式">
            <Button type="button" variant={signInMethod === "password" ? "secondary" : "ghost"} aria-pressed={signInMethod === "password"} onClick={() => { setSignInMethod("password"); setError(undefined); }}>
              密码登录
            </Button>
            <Button type="button" variant={signInMethod === "email-code" ? "secondary" : "ghost"} aria-pressed={signInMethod === "email-code"} onClick={() => { setSignInMethod("email-code"); setError(undefined); }}>
              邮箱验证码登录
            </Button>
          </div>
        ) : null}
        {notice ? (
          <Alert variant="success" role="status">
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        ) : null}
        {verificationEmail ? (
          <>
            <p className="text-label text-subtle">完成邮箱验证后即可使用账号。验证码有效期为 5 分钟。</p>
            <EmailCodeForm
              key={`verify-${verificationEmail}`}
              mode="verify-email"
              initialEmail={verificationEmail}
              initialSent={verificationSent}
              onSuccess={() => {
                setVerificationEmail(undefined);
                setVerificationSent(false);
                setMode("sign-in");
                setSignInMethod("password");
                setNotice("邮箱验证完成，请登录。");
              }}
              onCancel={() => switchMode("sign-in")}
            />
          </>
        ) : mode === "sign-in" && signInMethod === "email-code" ? (
          <EmailCodeForm mode="sign-in" onSuccess={finishSignIn} onCancel={() => setSignInMethod("password")} />
        ) : (
      <form method="post" className="space-y-5" onSubmit={handleSubmit} noValidate>
        {mode === "sign-up" ? (
          <>
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
            <FormField
              id="inviteCode"
              label="邀请码"
              description="回中诗社目前仅接受持有效邀请码的同学注册。"
              required
              disabled={pending}
            >
              {(controlProps) => (
                <Input
                  {...controlProps}
                  name="inviteCode"
                  type="text"
                  autoComplete="off"
                  minLength={32}
                  maxLength={128}
                />
              )}
            </FormField>
          </>
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
          description={
            mode === "sign-up"
              ? `请使用 ${PASSWORD_MIN_LENGTH} 至 ${PASSWORD_MAX_LENGTH} 个字符。`
              : undefined
          }
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
              minLength={PASSWORD_MIN_LENGTH}
              maxLength={PASSWORD_MAX_LENGTH}
            />
          )}
        </FormField>

        {mode === "sign-in" ? (
          <p className="text-right text-label">
            <Link className="text-link" href="/forgot-password">
              忘记密码？
            </Link>
          </p>
        ) : null}

        <AuthErrorPopover message={error} open={errorOpen} onOpenChange={setErrorOpen} />

        <Button className="w-full" type="submit" loading={pending}>
          {pending ? "处理中…" : mode === "sign-up" ? "创建账号" : "登录"}
        </Button>
      </form>
        )}
      </div>
      {variant === "sign-in-only" ? (
        <p className="mt-4 text-center text-label text-subtle">
          还没有账号？
          <Link
            className="ml-1 text-link"
            href={`/login?mode=sign-up&next=${encodeURIComponent(
              getSafeRedirectPath(nextPath),
            )}`}
          >
            使用邀请码注册
          </Link>
        </p>
      ) : null}
    </>
  );

  return embedded ? (
    <div className="w-full" aria-label="认证表单">
      {content}
    </div>
  ) : (
    <Surface className="w-full" aria-label="认证表单">
      {content}
    </Surface>
  );
}
