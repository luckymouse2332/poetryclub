export type TransactionalEmail = Readonly<{
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}>;

export interface EmailTransport {
  readonly name: "development" | "test" | "resend";
  send(message: TransactionalEmail): Promise<void>;
}

export class EmailDeliveryError extends Error {
  readonly provider: EmailTransport["name"];
  readonly code: string;

  constructor(provider: EmailTransport["name"], code: string) {
    super("Transactional email delivery failed");
    this.name = "EmailDeliveryError";
    this.provider = provider;
    this.code = code;
  }
}

export function reportEmailDeliveryFailure(
  error: unknown,
  provider: EmailTransport["name"],
): EmailDeliveryError {
  const safeError =
    error instanceof EmailDeliveryError
      ? error
      : new EmailDeliveryError(provider, "unexpected_error");
  console.error("Password reset email delivery failed", {
    provider: safeError.provider,
    code: safeError.code,
  });
  return safeError;
}
