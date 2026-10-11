import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { APIRequestContext } from "@playwright/test";

export const EMAIL_TEST_OUTBOX_PATH = resolve(
  "test-results",
  "password-reset-email-outbox.jsonl",
);

type OutboxMessage = Readonly<{
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}>;

export async function clearEmailTestOutbox(): Promise<void> {
  await rm(EMAIL_TEST_OUTBOX_PATH, { force: true });
}

async function readMessages(): Promise<ReadonlyArray<OutboxMessage>> {
  try {
    const content = await readFile(EMAIL_TEST_OUTBOX_PATH, "utf8");
    return content
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line) as OutboxMessage);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function countEmailTestMessages(): Promise<number> {
  return (await readMessages()).length;
}

export async function waitForPasswordResetEmail(
  to: string,
  afterCount = 0,
): Promise<OutboxMessage & Readonly<{ resetUrl: string }>> {
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    const messages = await readMessages();
    const message = messages.slice(afterCount).findLast((item) => item.to === to);
    if (message) {
      const resetUrl = message.text.match(/^https?:\/\/\S+$/m)?.[0];
      if (!resetUrl) throw new Error("Password reset email has no reset URL");
      return { ...message, resetUrl };
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 50));
  }
  throw new Error(`Timed out waiting for password reset email to ${to}`);
}

export async function waitForEmailOtp(
  to: string,
  afterCount = 0,
): Promise<OutboxMessage & Readonly<{ otp: string }>> {
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    const messages = await readMessages();
    const message = messages.slice(afterCount).findLast((item) => item.to === to && item.subject.includes("验证码"));
    if (message) {
      const otp = message.text.match(/验证码是：(\d{6})/)?.[1];
      if (!otp) throw new Error("Email OTP message has no code");
      return { ...message, otp };
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 50));
  }
  throw new Error(`Timed out waiting for email OTP to ${to}`);
}

export async function verifyTestEmail(request: APIRequestContext, email: string): Promise<void> {
  const { otp } = await waitForEmailOtp(email);
  const response = await request.post("/api/auth/email-otp/verify-email", {
    data: { email, otp },
  });
  if (response.status() !== 200) {
    throw new Error(`Email verification failed with status ${response.status()}`);
  }
}
