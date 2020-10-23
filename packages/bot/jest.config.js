'use strict'

const base = require('../../jest.config')

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...base,
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tests/tsconfig.json',
      packageJson: '<rootDir>/package.json'
    }
  },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  testMatch: ['<rootDir>/tests/**/*.test.ts']
}
module.exports = config
