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
        'node/no-unpublished-import': 0,
        'unicorn/prefer-module': 2
      }
    }
  ]
}

module.exports = config
