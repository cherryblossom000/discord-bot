'use strict'

module.exports = {
  extends: ['plugin:@comrade-pingu/recommended'],
  plugins: ['@comrade-pingu'],

  rules: {
    'jsdoc/check-param-names': 0,
    'jsdoc/newline-after-description': 0,
    'jsdoc/require-param': 0,
    'jsdoc/require-throws': 0,
    'jsdoc/require-returns': 0
  },

  overrides: [
    {
      files: ['jest.config*.js'],
      parserOptions: {
        project: './tsconfig.config.json',
        tsconfigRootDir: __dirname
      }
    },
    {
      files: [
        'src/commands/*.ts',
        'src/regex-commands/*.ts',
        'src/events/*.ts'
      ],
      rules: {
        'import/no-unused-modules': 0
      }
    },
    {
      files: ['tests/**/*.test.ts'],
      env: {jest: true}
    }
  ]
}
