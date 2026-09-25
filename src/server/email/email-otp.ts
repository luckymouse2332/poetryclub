import "server-only";

import { createEmailOtpMessage, type EmailOtpPurpose } from "@/server/email/email-otp-message";
import { sendTransactionalEmail } from "@/server/email/transport";
import { getServerEnv } from "@/server/env";

export async function sendEmailOtp(input: Readonly<{
  to: string;
  otp: string;
  type: EmailOtpPurpose;
}>): Promise<void> {
  const env = getServerEnv();
  const fromAddress = env.EMAIL_FROM_ADDRESS ?? "development@poetryclub.invalid";
  await sendTransactionalEmail(createEmailOtpMessage({ ...input, fromAddress }));
}
