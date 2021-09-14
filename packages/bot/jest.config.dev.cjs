'use strict'

const base = require('./jest.config.cjs')

/** @typedef {import('@jest/types').Config.ConfigGlobals} ConfigGlobals */

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  ...base,
  collectCoverage: true,
  coverageReporters: ['lcov'],
  coveragePathIgnorePatterns: ['node_modules/'],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: '<rootDir>/tests/coverage',
  globals: {
    'ts-jest': {
      ...base.globals['ts-jest'],
      diagnostics: {
        ignoreCodes: [
          // Left side of comma operator is unused and has no side effects.
          2695,
          // '{0}' is declared but its value is never read.
          6133,
          // Property '{0}' is declared but its value is never read.
          6138,
          // All imports in import declaration are unused.
          6192,
          // '{0}' is declared but never used.
          6196,
          // All destructured elements are unused.
          6198,
          // All variables are unused.
          6199,
          // Unreachable code detected.
          7027,
          // Unused label
          7028
        ]
      }
    }
  }
}
