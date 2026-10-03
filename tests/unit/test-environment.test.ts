import { describe, expect, it } from "vitest";
import { testDatabaseUrl } from "../../scripts/test-environment.mjs";

describe("database test safety", () => {
  it("requires explicit test configuration", () => {
    expect(() => testDatabaseUrl({ DATABASE_URL: "postgres://localhost/poetryclub" })).toThrow();
    expect(() => testDatabaseUrl({ TEST_DATABASE_URL: "postgres://localhost/poetryclub" })).toThrow();
    expect(() => testDatabaseUrl({ TEST_DATABASE_URL: "postgres://remote.example/poetryclub_test" })).toThrow();
  });
  it("accepts a dedicated local test database", () => {
    expect(testDatabaseUrl({ TEST_DATABASE_URL: "postgres://localhost/poetryclub_test" })).toBe("postgres://localhost/poetryclub_test");
  });
});
