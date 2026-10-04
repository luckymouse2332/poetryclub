import * as nextEnv from "@next/env";
import { existsSync, readFileSync } from "node:fs";

/** Database suites mutate account authority; never fall back to the app database. */
export function testDatabaseUrl(env) {
  const value = env.TEST_DATABASE_URL;
  if (!value) throw new Error("Set TEST_DATABASE_URL to a dedicated local *_test database in .env.test.local");
  const url = new URL(value);
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      !/^\/(?:test_[a-z0-9_]+|[a-z0-9_]+_test)$/i.test(url.pathname)) {
    throw new Error("Database tests require an explicitly named local test database");
  }
  return value;
}

export function configureTestEnvironment() {
  const envLoader = nextEnv.default ?? nextEnv;
  envLoader.loadEnvConfig(process.cwd(), false, console, true);
  // Load only the explicit test configuration; never overwrite app credentials on disk.
  if (existsSync(".env.test.local")) {
    envLoader.processEnv([
      { path: ".env.test.local", contents: readFileSync(".env.test.local", "utf8"), env: {} },
    ], process.cwd(), console, true);
  }
  process.env.DATABASE_URL = testDatabaseUrl(process.env);
}

export function testApplicationUrl(env) {
  if (env.PLAYWRIGHT_REUSE_SERVER === "1") {
    throw new Error("E2E must start its own server with TEST_DATABASE_URL; a reused server's database cannot be verified");
  }
  const value = env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4000";
  const url = new URL(value);
  if (url.protocol !== "http:" ||
      !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
    throw new Error("E2E requires a local HTTP application origin");
  }
  return value;
}
