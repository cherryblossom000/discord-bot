'use strict'

const base = require('../../jest.config')

/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...base,
  globals: {'ts-jest': {packageJson: '<rootDir>/package.json'}},
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  testMatch: ['<rootDir>/tests/**/*.test.ts']
}
