import config from "../../eslint.config.mjs";

export default [
  ...config,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "none",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
    },
  },
];
