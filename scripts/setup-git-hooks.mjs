#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { chmodSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const hookDirectory = fileURLToPath(new URL("../.githooks/", import.meta.url));

for (const hookName of ["commit-msg", "pre-push"]) {
  const hookPath = `${hookDirectory}${hookName}`;
  if (!existsSync(hookPath)) {
    throw new Error(`Missing Git hook: ${hookPath}`);
  }
  if (process.platform !== "win32") {
    chmodSync(hookPath, 0o755);
  }
}

execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
  cwd: repoRoot,
  stdio: "inherit",
});

process.stdout.write("Git hooks 已启用，core.hooksPath=.githooks。\n");
