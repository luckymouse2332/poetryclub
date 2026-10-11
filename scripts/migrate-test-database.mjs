import { spawnSync } from "node:child_process";
import { configureTestEnvironment } from "./test-environment.mjs";

configureTestEnvironment();
const result = spawnSync(process.execPath, ["node_modules/drizzle-kit/bin.cjs", "migrate"], {
  cwd: process.cwd(), env: process.env, stdio: "inherit",
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
