'use strict'

module.exports = {
  parserOptions: {
    project: './src/tsconfig.json',
    tsconfigRootDir: __dirname
  },
  rules: {
    // Only for types
    'node/no-unpublished-import': [2, {allowModules: ['@commitlint/types']}]
  },
  overrides: [
    {
      files: ['src/index.ts'],
      rules: {
        // Main file
        'import/no-unused-modules': 0
      }
    }
  ]
}
