import { defineConfig, devices } from "@playwright/test";

import { EMAIL_TEST_OUTBOX_PATH } from "./tests/e2e/helpers/email-outbox";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4000";
const webServerUrl = new URL(baseURL);
const webServerPort = webServerUrl.port || "4000";

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
  webServer:
    process.env.PLAYWRIGHT_REUSE_SERVER === "1"
      ? undefined
      : {
          command: `pnpm exec next dev --hostname ${webServerUrl.hostname} --port ${webServerPort}`,
          url: baseURL,
          reuseExistingServer: false,
          env: {
            BETTER_AUTH_URL: baseURL,
            REDIS_URL: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
            EMAIL_TRANSPORT: "test",
            EMAIL_TEST_OUTBOX_PATH,
          },
        },
});
