import { describe, expect, it } from "vitest";

import {
  parseDatabaseEnv,
  parseServerEnv,
} from "@/server/validation/env";

const validEnv = {
  DATABASE_URL: "postgresql://user:password@localhost:5432/poetryclub",
  BETTER_AUTH_SECRET: "a-secure-test-secret-with-32-characters",
  BETTER_AUTH_URL: "http://localhost:3000",
};

describe("parseServerEnv", () => {
  it("accepts the required server environment", () => {
    expect(parseServerEnv(validEnv)).toEqual(validEnv);
  });

  it("rejects missing variables without including their values", () => {
    expect(() => parseServerEnv({})).toThrow(
      "Invalid server environment variables: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL",
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
