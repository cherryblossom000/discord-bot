'use strict'

module.exports = {
  forceExit: true,
  globals: {'ts-jest': {packageJson: './package.json'}},
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts']
}
