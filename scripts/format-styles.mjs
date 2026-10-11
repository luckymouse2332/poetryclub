import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import process from "node:process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const patterns = [
  "src/**/*.tsx",
  "src/**/*.css",
  "src/lib/utils.ts",
  "src/lib/navigation-styles.ts",
  "src/server/email/{template,styles,password-reset-message,email-otp-message}.ts",
  "scripts/{format-styles,eslint-design-system}.mjs",
  "{prettier,stylelint,eslint}.config.mjs",
  "tests/unit/{design-system,design-system-rules,email-template}.test.ts",
];
const result = spawnSync(
  process.execPath,
  [
    require.resolve("prettier/bin/prettier.cjs"),
    process.argv.includes("--write") ? "--write" : "--check",
    ...patterns,
  ],
  {
    cwd: fileURLToPath(new URL("../", import.meta.url)),
    stdio: "inherit",
  },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
