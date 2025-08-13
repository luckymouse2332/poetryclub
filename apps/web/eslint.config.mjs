import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
