import { z } from "zod";

export const databaseEnvSchema = z.object({
  DATABASE_URL: z
    .string()
    .regex(/^postgres(?:ql)?:\/\//, "must be a PostgreSQL connection URL"),
});

export const serverEnvSchema = databaseEnvSchema.extend({
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "must contain at least 32 characters"),
  BETTER_AUTH_URL: z.url().refine(
    (value) => value.startsWith("http://") || value.startsWith("https://"),
    "must use http or https",
  ),
});

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
