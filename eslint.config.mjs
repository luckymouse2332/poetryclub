import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  {
    ignores: ["dist", "build", ".next", ".svelte-kit", "node_modules", "**/*.svg"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["**/*.ts", "**/*.js"],
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
    },
  },
];
