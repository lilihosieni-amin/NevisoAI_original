/** Root ESLint config — shared baseline for all workspaces. */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  env: {
    node: true,
    es2021: true,
    jest: true,
    browser: true,
  },
  ignorePatterns: [
    'node_modules',
    'dist',
    '.next',
    'generated',
    'coverage',
    '*.config.js',
    '*.config.cjs',
    '*.config.mjs',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-empty-function': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
  },
};
