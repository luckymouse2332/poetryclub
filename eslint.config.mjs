import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["dist", "build", ".next", ".svelte-kit", "node_modules"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...prettier,
  },
  {
    files: ["**/*.ts", "**/*.js"],

    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },

    rules: {
      "prettier/prettier": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": "warn",
    },
  },
];
