'use strict'

// eslint-disable-next-line jsdoc/no-undefined-types -- unknown types
const [, ...originalNamingConventionRules] =
  /** @type {{rules: {'@typescript-eslint/naming-convention': [number, ...unknown[]]}}} */ (
    require('@cherryblossom/eslint-config/ts/index')
  ).rules['@typescript-eslint/naming-convention']

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
module.exports = {
  extends: ['plugin:@comrade-pingu/recommended'],
  plugins: ['@comrade-pingu'],
  ignorePatterns: ['tests/coverage/'],
  parserOptions: {
    project: 'tsconfig.eslint.json',
    tsconfigRootDir: __dirname
  },

  rules: {
    'jsdoc/check-param-names': 0,
    'jsdoc/newline-after-description': 0,
    'jsdoc/require-param': 0,
    'jsdoc/require-throws': 0,
    'jsdoc/require-returns': 0,
    // Just for types
    'node/no-unpublished-import': [
      2,
      {
        allowModules: [
          'discord-api-types',
          'discord-api-types-old',
          'mathjax-full',
          'type-fest'
        ]
      }
    ]
  },

  overrides: [
    {
      files: '**/*.ts',
      rules: {
        '@typescript-eslint/naming-convention': [
          1,
          ...originalNamingConventionRules,
          {
            selector: ['variable', 'parameter'],
            filter: '^_id$',
            format: null
          }
        ]
      }
    },
    {
      files: '**/*.d.ts',
      rules: {
        '@typescript-eslint/naming-convention': 0
      }
    }
  ]
}
