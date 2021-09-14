'use strict'

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
module.exports = {
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },

  rules: {
    // Only for types
    'node/no-unpublished-import': [2, {allowModules: ['@commitlint/types']}]
  },
  overrides: [
    {
      files: 'src/index.ts',
      rules: {
        // Main file
        'import/no-unused-modules': 0
      }
    }
  ]
}
