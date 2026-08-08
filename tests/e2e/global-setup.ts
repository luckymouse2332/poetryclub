import { spawnSync } from "node:child_process";

import * as nextEnv from "@next/env";

import { clearEmailTestOutbox } from "./helpers/email-outbox";

export const E2E_ADMIN_EMAIL = "e2e-admin@poetryclub.test";
export const E2E_ADMIN_PASSWORD = "e2e-admin-password-123";

export default async function globalSetup(): Promise<void> {
  nextEnv.loadEnvConfig(process.cwd());
  await clearEmailTestOutbox();
  const result = spawnSync("pnpm admin:bootstrap", {
    cwd: process.cwd(),
    env: {
      ...process.env,
      INITIAL_ADMIN_EMAIL: E2E_ADMIN_EMAIL,
      INITIAL_ADMIN_NAME: "E2E 测试管理员",
      INITIAL_ADMIN_PASSWORD: E2E_ADMIN_PASSWORD,
    },
    encoding: "utf8",
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(
      `Unable to bootstrap the E2E administrator. Run migrations first.\n${result.error?.message ?? result.stderr ?? result.stdout}`,
    );
  }
}
