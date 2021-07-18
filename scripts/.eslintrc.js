'use strict'

const path = require('path')

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
const config = {
  overrides: [
    {
      files: 'src/**/*.ts',
      rules: {
        'import/no-extraneous-dependencies': 0,
        'import/no-unassigned-import': [
          1,
          {allow: [path.join(__dirname, 'src', 'url')]}
        ],
        'node/no-unpublished-import': 0
      }
    },
    {
      files: 'src/exit-on-error.ts',
      rules: {
        // haven't figured out how to have import resolver for relative files
        // other scripts import this file but as dist/exit-on-error.js
        'import/no-unused-modules': 0
      }
    }
  ]
}

module.exports = config
