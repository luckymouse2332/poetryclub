import { describe, expect, it } from "vitest";

import {
  parseDatabaseEnv,
  parseServerEnv,
} from "@/server/validation/env";

const validEnv = {
  DATABASE_URL: "postgresql://user:password@localhost:5432/poetryclub",
  REDIS_URL: "redis://localhost:6379",
  BETTER_AUTH_SECRET: "a-secure-test-secret-with-32-characters",
  BETTER_AUTH_URL: "http://localhost:3000",
};

describe("parseServerEnv", () => {
  it("accepts the required server environment", () => {
    expect(parseServerEnv(validEnv)).toEqual({
      ...validEnv,
      NODE_ENV: "development",
      EMAIL_TRANSPORT: "development",
    });
  });

  it("requires a real email transport configuration in production", () => {
    expect(() =>
      parseServerEnv({ ...validEnv, NODE_ENV: "production" }),
    ).toThrow("RESEND_API_KEY, EMAIL_FROM_ADDRESS");

    expect(() =>
      parseServerEnv({
        ...validEnv,
        NODE_ENV: "production",
        EMAIL_TRANSPORT: "development",
      }),
    ).toThrow("EMAIL_TRANSPORT");
  });

  it("accepts a complete production Resend configuration", () => {
    expect(
      parseServerEnv({
        ...validEnv,
        NODE_ENV: "production",
        EMAIL_TRANSPORT: "resend",
        RESEND_API_KEY: "re_test_key",
        EMAIL_FROM_ADDRESS: "poetry@example.edu",
      }),
    ).toMatchObject({
      NODE_ENV: "production",
      EMAIL_TRANSPORT: "resend",
      EMAIL_FROM_ADDRESS: "poetry@example.edu",
    });
  });

  it("requires an explicit outbox path for the test transport", () => {
    expect(() =>
      parseServerEnv({ ...validEnv, EMAIL_TRANSPORT: "test" }),
    ).toThrow("EMAIL_TEST_OUTBOX_PATH");
  });

  it("rejects missing variables without including their values", () => {
    expect(() => parseServerEnv({})).toThrow(
      "Invalid server environment variables: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, REDIS_URL",
    );
  });

  it("rejects non-PostgreSQL database URLs", () => {
    expect(() =>
      parseServerEnv({ ...validEnv, DATABASE_URL: "mysql://localhost/db" }),
    ).toThrow("DATABASE_URL");
  });
});

describe("parseDatabaseEnv", () => {
  it("accepts a PostgreSQL URL without auth variables", () => {
    expect(parseDatabaseEnv({ DATABASE_URL: validEnv.DATABASE_URL })).toEqual({
      DATABASE_URL: validEnv.DATABASE_URL,
    });
  });

  it("rejects a non-PostgreSQL URL", () => {
    expect(() => parseDatabaseEnv({ DATABASE_URL: "https://example.com" })).toThrow(
      "DATABASE_URL",
    );
  });
});
