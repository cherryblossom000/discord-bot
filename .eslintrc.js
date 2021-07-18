'use strict'

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
const config = {
  root: true,
  extends: [
    '@cherryblossom/eslint-config/node',
    '@cherryblossom/eslint-config/node/12'
  ],
  reportUnusedDisableDirectives: true,
  ignorePatterns: ['.history/', 'dist/', 'tests/coverage/'],
  parserOptions: {
    project: 'tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true
  },
  overrides: [
    {
      files: ['**/*.config*.js', '**/.eslintrc.js'],
      settings: {
        jsdoc: {mode: 'typescript'}
      },
      rules: {
        camelcase: 0,
        'id-length': 0
      }
    },
    {
      files: '**/*.config*.js',
      rules: {
        // Allow @typedef {import('ts-jest')} (stops 'Tag @typedef must have a name/namepath in "typescript" mode')
        'jsdoc/valid-types': 0,
        'node/no-unpublished-require': 0
      }
    },
    {
      files: ['scripts/**/*.ts', 'packages/*/scripts/**/*.ts'],
      extends: [
        '@cherryblossom/eslint-config/ts/node/esm',
        '@cherryblossom/eslint-config/node/12'
      ],
      rules: {
        'node/no-extraneous-import': 0,
        'node/no-process-exit': 0,
        'node/no-unpublished-import': 0
      }
    }
  ]
}
module.exports = config
