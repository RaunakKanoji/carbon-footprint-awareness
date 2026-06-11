import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';
import tailwindPlugin from 'eslint-plugin-tailwindcss';
import { defineConfig, globalIgnores } from 'eslint/config';
import { fileURLToPath } from 'node:url';

const tailwindCssPath = fileURLToPath(new URL('./app/globals.css', import.meta.url));

const eslintConfig = defineConfig([
  // Next.js recommended configs
  ...nextVitals,
  ...nextTs,

  // Tailwind recommended
  ...tailwindPlugin.configs['flat/recommended'],

  // Prettier (disables formatting rules that conflict with Prettier — must be last)
  prettierConfig,

  // Our custom overrides. Next and Tailwind configs register their own plugins in flat config,
  // so this block only customizes rules to avoid duplicate plugin definitions.
  {
    settings: {
      react: { version: 'detect' },
      tailwindcss: {
        config: tailwindCssPath,
      },
    },
    rules: {
      // React 17+ JSX transform — no need to import React
      'react/react-in-jsx-scope': 'off',
      // Unused vars: allow underscore-prefixed args
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Allow custom class names (our design token classes like bg-bg-base)
      'tailwindcss/no-custom-classname': 'off',
      // Prettier owns Tailwind class ordering; the ESLint rule has partial Tailwind v4 support.
      'tailwindcss/classnames-order': 'off',
      // Accessibility recommended rules
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',
    },
  },

  // Ignore patterns
  globalIgnores([
    '.next/**',
    '**/.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'node_modules/**',
    'app/generated/**',
  ]),
]);

export default eslintConfig;
