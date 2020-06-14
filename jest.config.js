'use strict'

module.exports = {
  globals: {'ts-jest': {packageJson: './package.json'}},
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/scripts/**/*.test.ts']
}
