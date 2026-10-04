import { describe, expect, it } from "vitest";
import { testApplicationUrl, testDatabaseUrl } from "../../scripts/test-environment.mjs";

describe("database test safety", () => {
  it("requires explicit test configuration", () => {
    expect(() => testDatabaseUrl({ DATABASE_URL: "postgres://localhost/poetryclub" })).toThrow();
    expect(() => testDatabaseUrl({ TEST_DATABASE_URL: "postgres://localhost/poetryclub" })).toThrow();
    expect(() => testDatabaseUrl({ TEST_DATABASE_URL: "postgres://remote.example/poetryclub_test" })).toThrow();
    expect(() => testDatabaseUrl({ TEST_DATABASE_URL: "postgres://localhost/latest" })).toThrow();
    expect(() => testDatabaseUrl({ TEST_DATABASE_URL: "https://localhost/poetryclub_test" })).toThrow();
  });
  it("accepts a dedicated local test database", () => {
    expect(testDatabaseUrl({ TEST_DATABASE_URL: "postgres://localhost/poetryclub_test" })).toBe("postgres://localhost/poetryclub_test");
  });
  it("rejects an unverified reused server or a remote application", () => {
    expect(() => testApplicationUrl({ PLAYWRIGHT_REUSE_SERVER: "1" })).toThrow();
    expect(() => testApplicationUrl({ PLAYWRIGHT_BASE_URL: "https://production.example" })).toThrow();
    expect(() => testApplicationUrl({ PLAYWRIGHT_BASE_URL: "https://localhost:4000" })).toThrow();
    expect(() => testApplicationUrl({ PLAYWRIGHT_BASE_URL: "http://localhost:4000/poems" })).toThrow();
    expect(() => testApplicationUrl({ PLAYWRIGHT_BASE_URL: "http://user:password@localhost:4000" })).toThrow();
  });
  it("accepts the default or an explicitly configured local test port", () => {
    expect(testApplicationUrl({})).toBe("http://localhost:4000");
    expect(testApplicationUrl({ PLAYWRIGHT_BASE_URL: "http://127.0.0.1:4010" })).toBe("http://127.0.0.1:4010");
  });
});
