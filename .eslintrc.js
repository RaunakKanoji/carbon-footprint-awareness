module.exports = {
  root: true,
  ignorePatterns: ['app/generated/**', '.claude/**', 'node_modules/**', '.next/**'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'jsx-a11y', 'tailwindcss'],
  extends: [
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:tailwindcss/recommended',
    'prettier',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'tailwindcss/no-custom-classname': 'off',
  },
  settings: {
    react: { version: 'detect' },
  },
};
