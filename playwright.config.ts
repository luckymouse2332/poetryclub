import { defineConfig, devices } from "@playwright/test";

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
  webServer: {
    command: `pnpm dev --hostname ${webServerUrl.hostname} --port ${webServerPort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
