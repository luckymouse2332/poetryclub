import { z } from "zod";

export const databaseEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .regex(/^postgres(?:ql)?:\/\//, "must be a PostgreSQL connection URL"),
});

const emailTransportSchema = z.enum(["development", "test", "resend"]);

export const serverEnvSchema = databaseEnvSchema
  .extend({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "must contain at least 32 characters"),
    BETTER_AUTH_URL: z.url().refine(
      (value) => value.startsWith("http://") || value.startsWith("https://"),
      "must use http or https",
    ),
    EMAIL_TRANSPORT: emailTransportSchema.optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM_ADDRESS: z.email().optional(),
    EMAIL_TEST_OUTBOX_PATH: z.string().min(1).optional(),
  })
  .superRefine((input, context) => {
    const transport =
      input.EMAIL_TRANSPORT ??
      (input.NODE_ENV === "production" ? "resend" : "development");

    if (input.NODE_ENV === "production" && transport !== "resend") {
      context.addIssue({
        code: "custom",
        path: ["EMAIL_TRANSPORT"],
        message: "must use resend in production",
      });
    }

    if (transport === "resend") {
      if (!input.RESEND_API_KEY) {
        context.addIssue({
          code: "custom",
          path: ["RESEND_API_KEY"],
          message: "is required for the resend transport",
        });
      }
      if (!input.EMAIL_FROM_ADDRESS) {
        context.addIssue({
          code: "custom",
          path: ["EMAIL_FROM_ADDRESS"],
          message: "is required for the resend transport",
        });
      }
    }

    if (transport === "test" && !input.EMAIL_TEST_OUTBOX_PATH) {
      context.addIssue({
        code: "custom",
        path: ["EMAIL_TEST_OUTBOX_PATH"],
        message: "is required for the test transport",
      });
    }
  })
  .transform((input) => ({
    ...input,
    EMAIL_TRANSPORT:
      input.EMAIL_TRANSPORT ??
      (input.NODE_ENV === "production" ? "resend" : "development"),
  }));

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseDatabaseEnv(
  input: Record<string, string | undefined>,
) {
  const result = databaseEnvSchema.safeParse(input);

  if (!result.success) {
    throw new Error("Invalid database environment variable: DATABASE_URL");
  }

  return result.data;
}

export function parseServerEnv(
  input: Record<string, string | undefined>,
): ServerEnv {
  const result = serverEnvSchema.safeParse(input);

  if (!result.success) {
    const fields = Object.keys(z.flattenError(result.error).fieldErrors).join(
      ", ",
    );
    throw new Error(`Invalid server environment variables: ${fields}`);
  }

  return result.data;
}
