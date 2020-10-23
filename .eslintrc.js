'use strict'

module.exports = {
  root: true,
  extends: ['@cherryblossom/eslint-config/node'],
  reportUnusedDisableDirectives: true,
  ignorePatterns: ['.history/', 'dist/', 'tests/coverage/'],
  overrides: [
    {
      files: ['**/*.config*.js'],
      rules: {
        // Allow @typedef {import('ts-jest')} (stops 'Tag @typedef must have a name/namepath in "typescript" mode')
        'jsdoc/valid-types': 0,
        'node/no-unpublished-require': 0
      }
    },
    {
      files: ['scripts/**', 'packages/*/scripts/**'],
      rules: {
        'node/no-extraneous-import': 0,
        'node/no-process-exit': 0,
        'node/no-unpublished-import': 0
      }
    },
    {
      files: ['*.config*.js'],
      parserOptions: {
        project: './tsconfig.config.json',
        tsconfigRootDir: __dirname
      }
    }
  ]
}
