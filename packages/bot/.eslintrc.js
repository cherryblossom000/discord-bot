'use strict'

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
const config = {
  extends: ['plugin:@comrade-pingu/recommended'],
  plugins: ['@comrade-pingu'],
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname
  },

  rules: {
    'jsdoc/check-param-names': 0,
    'jsdoc/newline-after-description': 0,
    'jsdoc/require-param': 0,
    'jsdoc/require-throws': 0,
    'jsdoc/require-returns': 0,
    // Just for types
    'node/no-unpublished-import': [2, {allowModules: ['mathjax-full']}]
  },

  overrides: [
    {
      files: [
        'src/commands/*.ts',
        'src/regex-commands/*.ts',
        'src/events/*.ts'
      ],
      rules: {
        'import/no-unused-modules': 0
      }
    }
  ]
}
module.exports = config
