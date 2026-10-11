import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import designSystem from "./scripts/eslint-design-system.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "design-system": designSystem },
    rules: { "design-system/semantic-styles": "error" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright rewrites these generated reports while browser checks run.
    "playwright-report/**",
    "test-results/**",
    "output/playwright/**",
    // Local agent runtimes are not application source and may be mounted or
    // removed independently of the repository checkout.
    ".agents/**",
    ".claude/**",
    ".codex/**",
  ]),
]);

export default eslintConfig;
