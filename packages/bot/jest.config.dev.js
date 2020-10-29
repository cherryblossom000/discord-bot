'use strict'

const base = require('../../jest.config.dev')
const mainBase = require('./jest.config')

/** @typedef {import('@jest/types').Config.ConfigGlobals} ConfigGlobals */

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...base,
  ...mainBase,
  // globals: {
  //   'ts-jest': {
  //     .../** @type {ConfigGlobals} */ (base.globals)['ts-jest'],
  //     .../** @type {ConfigGlobals} */ (mainBase.globals)['ts-jest'],
  //     tsconfig: '<rootDir>/tests/tsconfig.dev.json'
  //   }
  // },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: '<rootDir>/tests/coverage'
}
module.exports = config
