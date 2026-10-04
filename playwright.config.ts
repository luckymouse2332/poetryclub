import { defineConfig, devices } from "@playwright/test";

import { EMAIL_TEST_OUTBOX_PATH } from "./tests/e2e/helpers/email-outbox";
import { configureTestEnvironment, testApplicationUrl } from "./scripts/test-environment.mjs";

configureTestEnvironment();

const baseURL = testApplicationUrl(process.env);
const webServerUrl = new URL(baseURL);
const webServerPort = webServerUrl.port || "80";
const webServerHostname = webServerUrl.hostname.replace(/^\[|\]$/g, "");

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  // E2E exercises global invariants (notably the last-active-admin lock) in a
  // shared PostgreSQL database. Run one worker so those reversible state
  // transitions cannot interfere with invitation/auth fixtures in other files.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm exec next dev --hostname ${webServerHostname} --port ${webServerPort}`,
    url: baseURL,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: process.env.DATABASE_URL!,
      BETTER_AUTH_URL: baseURL,
      REDIS_URL: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
      EMAIL_TRANSPORT: "test",
      EMAIL_TEST_OUTBOX_PATH,
    },
  },
});
