import "server-only";

import { createPasswordResetEmail } from "@/server/email/password-reset-message";
import { getServerEnv } from "@/server/env";
import {
  type EmailTransport,
  EmailDeliveryError,
  reportEmailDeliveryFailure,
} from "@/server/email/types";

function createDevelopmentTransport(): EmailTransport {
  return {
    name: "development",
    async send(message) {
      console.info(
        `[仅限开发环境的密码重置邮件] 收件人：${message.to}\n${message.text}`,
      );
    },
  };
}

function createTestTransport(outboxPath: string): EmailTransport {
  return {
    name: "test",
    async send(message) {
      const { appendFile, mkdir } = await import("node:fs/promises");
      const { dirname } = await import("node:path");
      await mkdir(dirname(outboxPath), { recursive: true });
      await appendFile(outboxPath, `${JSON.stringify(message)}\n`, "utf8");
    },
  };
}

function createResendTransport(apiKey: string): EmailTransport {
  return {
    name: "resend",
    async send(message) {
      let response: Response;
      try {
        response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            authorization: `Bearer ${apiKey}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(message),
          signal: AbortSignal.timeout(10_000),
          cache: "no-store",
        });
      } catch {
        throw new EmailDeliveryError("resend", "network_error");
      }

      if (!response.ok) {
        throw new EmailDeliveryError("resend", `http_${response.status}`);
      }
    },
  };
}

export async function sendPasswordResetEmail(input: Readonly<{
  to: string;
  resetUrl: string;
}>): Promise<void> {
  const env = getServerEnv();
  const fromAddress = env.EMAIL_FROM_ADDRESS ?? "development@poetryclub.invalid";
  const message = createPasswordResetEmail({ ...input, fromAddress });
  const transport =
    env.EMAIL_TRANSPORT === "resend"
      ? createResendTransport(env.RESEND_API_KEY!)
      : env.EMAIL_TRANSPORT === "test"
        ? createTestTransport(env.EMAIL_TEST_OUTBOX_PATH!)
        : createDevelopmentTransport();

  try {
    await transport.send(message);
  } catch (error) {
    throw reportEmailDeliveryFailure(error, transport.name);
  }
}
