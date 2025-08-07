import path from 'path';
import rootConfig from '../../eslint.config.mjs';

export default [
  ...rootConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: path.join(__dirname, "tsconfig.json")
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
