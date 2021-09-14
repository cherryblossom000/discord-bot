'use strict'

const tsConfig = require('../../tsconfig.settings.json')

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  rootDir: __dirname,
  globals: {
    'ts-jest': {
      // tsconfig: '<rootDir>/tests/tsconfig.json'
      // hack to get around https://github.com/kulshekhar/ts-jest/issues/1648
      tsconfig: tsConfig.compilerOptions,
      useESM: true
    }
  },
  moduleNameMapper: {
    '^(\\.\\.?/.*)\\.js$': '$1',
    // doesn't support the exports field
    // https://github.com/browserify/resolve/issues/222
    '^discord.js$': '<rootDir>/node_modules/discord.js/esm/discord.mjs'
  },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  testMatch: ['<rootDir>/tests/**/*.test.ts']
}
