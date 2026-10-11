import { spawnSync } from "node:child_process";

import { configureTestEnvironment } from "./test-environment.mjs";
configureTestEnvironment();

const result = spawnSync(
  process.execPath,
  [
    "node_modules/vitest/vitest.mjs",
    "run",
    "--config",
    "vitest.integration.config.mts",
    ...process.argv.slice(2),
  ],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      REDIS_URL: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
    },
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
