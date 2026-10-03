import * as nextEnv from "@next/env";
import { existsSync } from "node:fs";

/** Database suites mutate account authority; never fall back to the app database. */
export function testDatabaseUrl(env) {
  const value = env.TEST_DATABASE_URL;
  if (!value) throw new Error("Set TEST_DATABASE_URL to a dedicated local *_test database in .env.test.local");
  const url = new URL(value);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
      !/^\/[a-z0-9_]*test[a-z0-9_]*$/i.test(url.pathname)) {
    throw new Error("Database tests require an explicitly named local test database");
  }
  return value;
}

export function configureTestEnvironment() {
  (nextEnv.default ?? nextEnv).loadEnvConfig(process.cwd(), false, console, true);
  // Load only the explicit test configuration; never overwrite app credentials on disk.
  if (existsSync(".env.test.local")) process.loadEnvFile(".env.test.local");
  process.env.DATABASE_URL = testDatabaseUrl(process.env);
}
