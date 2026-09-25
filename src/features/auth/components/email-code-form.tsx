"use client";

import { type FormEvent, useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/features/auth/auth-client";
import { AuthErrorPopover } from "@/features/auth/components/auth-error-popover";
import { emailCodeSchema, emailSchema } from "@/features/auth/validation";

type EmailCodeMode = "sign-in" | "verify-email";

function codeError(code?: string, status?: number): string {
  if (status === 429) return "尝试过于频繁，请稍后再试。";
  if (code === "OTP_EXPIRED") return "验证码已过期，请重新发送。";
  if (code === "TOO_MANY_ATTEMPTS") return "验证码错误次数过多，请重新发送。";
  return "验证码无效或已使用，请检查后重试。";
}

export function EmailCodeForm({
  mode,
  initialEmail = "",
  initialSent = false,
  onSuccess,
  onCancel,
}: Readonly<{
  mode: EmailCodeMode;
  initialEmail?: string;
  initialSent?: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}>) {
  const [email, setEmail] = useState(initialEmail);
  const [codeSent, setCodeSent] = useState(initialSent);
  const [cooldown, setCooldown] = useState(initialSent ? 60 : 0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [errorOpen, setErrorOpen] = useState(false);
  const [notice, setNotice] = useState<string | undefined>(
    initialSent ? "验证码已发送，请查收邮件；若未收到，可稍后重新发送。" : undefined,
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const timeout = window.setTimeout(() => setCooldown((current) => current - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [cooldown]);

  function showError(message: string) {
    setError(message);
    setErrorOpen(true);
    setNotice(undefined);
  }

  async function requestCode() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      showError(parsed.error.issues[0]?.message ?? "请输入有效的邮箱地址。");
      return;
    }
    setPending(true);
    setError(undefined);
    setErrorOpen(false);
    try {
      const result = await authClient.emailOtp.sendVerificationOtp({
        email: parsed.data,
        type: mode === "sign-in" ? "sign-in" : "email-verification",
      });
      if (result.error) {
        showError(result.error.status === 429 ? "发送过于频繁，请稍后再试。" : "验证码暂时无法发送，请稍后重试。");
        return;
      }
      setEmail(parsed.data);
      setCodeSent(true);
      setCooldown(60);
      setNotice(mode === "sign-in"
        ? "如果该邮箱已有账号，验证码将发送到邮箱。"
        : "验证码已发送，请查收邮件。"
      );
    } catch {
      showError("暂时无法连接服务器，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!codeSent) {
      await requestCode();
      return;
    }
    const code = new FormData(event.currentTarget).get("otp");
    const parsed = emailCodeSchema.safeParse(code);
    if (!parsed.success) {
      showError(parsed.error.issues[0]?.message ?? "请输入验证码。");
      return;
    }
    setPending(true);
    setError(undefined);
    setErrorOpen(false);
    try {
      const result = mode === "sign-in"
        ? await authClient.signIn.emailOtp({ email, otp: parsed.data })
        : await authClient.emailOtp.verifyEmail({ email, otp: parsed.data });
      if (result.error) {
        showError(codeError(result.error.code, result.error.status));
        return;
      }
      onSuccess();
    } catch {
      showError("暂时无法连接服务器，请稍后重试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form method="post" className="space-y-5" onSubmit={handleSubmit} noValidate>
      <FormField
        id="email"
        label="邮箱"
        description={codeSent ? "验证码发送到这个邮箱。" : "仅已注册邮箱可以使用验证码登录。"}
        required
        disabled={pending || codeSent || mode === "verify-email"}
      >
        {(controlProps) => (
          <Input
            {...controlProps}
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        )}
      </FormField>
      {codeSent ? (
        <FormField id="otp" label="6 位邮箱验证码" required disabled={pending}>
          {(controlProps) => (
            <Input
              {...controlProps}
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
            />
          )}
        </FormField>
      ) : null}
      <AuthErrorPopover message={error} open={errorOpen} onOpenChange={setErrorOpen} />
      {notice ? (
        <Alert variant="success" role="status">
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "处理中…" : codeSent ? mode === "sign-in" ? "验证并登录" : "验证邮箱" : "发送验证码"}
      </Button>
      {codeSent ? (
        <Button type="button" variant="ghost" className="w-full" disabled={pending || cooldown > 0} onClick={() => void requestCode()}>
          {cooldown > 0 ? `${cooldown} 秒后可重新发送` : "重新发送验证码"}
        </Button>
      ) : null}
      <Button type="button" variant="ghost" className="w-full" disabled={pending} onClick={onCancel}>
        {mode === "sign-in" ? "使用密码登录" : "返回登录"}
      </Button>
    </form>
  );
}
