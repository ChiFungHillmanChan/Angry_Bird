/* eslint-env node */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module', ecmaVersion: 'latest' },
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  ignorePatterns: ['dist', 'node_modules', '**/*.config.*', 'playwright-report', 'coverage'],
  rules: {
    'no-console': ['warn', { allow: ['error', 'warn', 'info'] }],
    '@typescript-eslint/no-explicit-any': 'error',
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], ['internal', 'parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true }
      }
    ]
  }
};


