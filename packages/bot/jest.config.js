'use strict'

const {readFileSync} = require('fs')
const {join} = require('path')
const base = require('../../jest.config')

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...base,
  rootDir: __dirname,
  globals: {
    'ts-jest': {
      // tsconfig: '<rootDir>/tests/tsconfig.json',
      // hack to get around https://github.com/kulshekhar/ts-jest/issues/1648
      tsconfig: {
        ...JSON.parse(
          readFileSync(
            join(__dirname, '..', '..', 'tsconfig.settings.json'),
            'utf8'
          )
        ).compilerOptions,
        esModuleInterop: true
      }
    }
  },
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  testMatch: ['<rootDir>/tests/**/*.test.ts']
}
module.exports = config
