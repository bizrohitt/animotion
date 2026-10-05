import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist/**', 'dist/**/*', 'node_modules/**', 'coverage/**', 'public/**', '**/*.map', '**/*.webmanifest'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      parserOptions: { projectService: false },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-empty': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    rules: { 'no-undef': 'off' },
  },
);
