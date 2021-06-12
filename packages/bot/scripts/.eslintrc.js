'use strict'

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
const config = {
  overrides: [
    {
      files: 'src/**/*.ts',
      extends: '../../../scripts/.eslintrc.js'
    }
  ]
}
module.exports = config
