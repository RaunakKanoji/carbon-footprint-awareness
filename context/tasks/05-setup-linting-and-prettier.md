# Configure ESLint and Prettier

## Goal

Establish robust linting and code formatting rules to maintain consistent code quality across the entire codebase. This task sets up ESLint, Prettier, and related plugins for TypeScript, React, Tailwind, and accessibility.

## Implementation

1. **Install ESLint and Plugins:** Ensure you have ESLint installed via `create-next-app`. If not, run:

   ```bash
   npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-tailwindcss eslint-config-prettier
   ```

2. **Install Prettier and Plugins:** Prettier ensures consistent formatting. Install Prettier and the Tailwind plugin:

   ```bash
   npm install -D prettier prettier-plugin-tailwindcss @trivago/prettier-plugin-sort-imports
   ```

   The import sorting plugin ensures deterministic ordering of imports for readability.

3. **Create `.eslintrc.js`:** Configure ESLint with recommended rules:

   ```js
   module.exports = {
     root: true,
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
   ```

   Adjust or extend rules as necessary according to the `code-standards.md` guidelines.

4. **Create `.prettierrc`:** Configure Prettier formatting options:

   ```json
   {
     "singleQuote": true,
     "semi": true,
     "trailingComma": "all",
     "tabWidth": 2,
     "printWidth": 100,
     "plugins": ["prettier-plugin-tailwindcss", "@trivago/prettier-plugin-sort-imports"],
     "importOrder": ["^react", "^@/", "^[./]"],
     "importOrderSeparation": true,
     "importOrderSortSpecifiers": true
   }
   ```

   This config instructs Prettier to sort imports and ensures Tailwind classes are ordered logically.

5. **Configure Editor Settings:** Create an `.editorconfig` file to enforce whitespace and newline settings across editors:

   ```ini
   root = true

   [*]
   charset = utf-8
   end_of_line = lf
   insert_final_newline = true
   indent_style = space
   indent_size = 2
   trim_trailing_whitespace = true
   ```

6. **Add Lint and Format Scripts:** Update `package.json` scripts:

   ```json
   {
     "scripts": {
       "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
       "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
       "format": "prettier --write ."
     }
   }
   ```

7. **Run and Validate:** Execute `npm run lint` and `npm run format` to ensure there are no lint errors and that code formatting runs successfully. Adjust rules or fix code accordingly.

## Check When Done

- `.eslintrc.js`, `.prettierrc`, and `.editorconfig` exist and reflect the rules described above.
- Running `npm run lint` surfaces no unexpected errors. Running `npm run lint:fix` automatically fixes minor issues.
- Code is consistently formatted after running `npm run format`, with sorted imports and ordered Tailwind classes.
- The development team understands where to locate linting and formatting rules, as documented in `code-standards.md`.
