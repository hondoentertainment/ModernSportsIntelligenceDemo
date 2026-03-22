import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // TypeScript safety
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // No console.log in production — use DEV guards
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // React hooks correctness
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General safety
      'no-undef': 'off', // TypeScript handles this
      'no-unused-vars': 'off', // TypeScript version handles this with underscore pattern
    },
  },
  {
    // apiLogger.info uses console.log for structured INFO lines
    files: ['api/**/*.ts'],
    rules: {
      'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    },
  },
  {
    // Relax rules in test files
    files: ['tests/**/*.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
  {
    ignores: ['dist/', 'node_modules/', 'loadInventory.js', 'scripts/templates/'],
  },
];
