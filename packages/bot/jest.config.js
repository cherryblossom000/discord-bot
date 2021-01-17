'use strict'

const base = require('../../jest.config')
const tsConfig = require('../../tsconfig.settings.json')

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...base,
  rootDir: __dirname,
  globals: {
    'ts-jest': {
      // tsconfig: '<rootDir>/tests/tsconfig.json',
      // hack to get around https://github.com/kulshekhar/ts-jest/issues/1648
      tsconfig: {
        ...tsConfig.compilerOptions,
        esModuleInterop: true
      }
    }
  },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  testMatch: ['<rootDir>/tests/**/*.test.ts']
}
module.exports = config
