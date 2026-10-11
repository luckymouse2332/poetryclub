import "server-only";

import { createPasswordResetEmail } from "@/server/email/password-reset-message";
import { sendTransactionalEmail } from "@/server/email/transport";
import { getServerEnv } from "@/server/env";

export async function sendPasswordResetEmail(input: Readonly<{
  to: string;
  resetUrl: string;
}>): Promise<void> {
  const env = getServerEnv();
  const fromAddress = env.EMAIL_FROM_ADDRESS ?? "development@poetryclub.invalid";
  await sendTransactionalEmail(createPasswordResetEmail({ ...input, fromAddress }));
}
