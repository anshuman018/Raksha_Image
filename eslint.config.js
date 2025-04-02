import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
    },
  }
];