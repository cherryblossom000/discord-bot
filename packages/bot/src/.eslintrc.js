'use strict'

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
const config = {
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  }
}
module.exports = config
