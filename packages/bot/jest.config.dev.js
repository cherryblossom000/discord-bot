'use strict'

const base = require('../../jest.config.dev')
const mainBase = require('./jest.config')

/** @typedef {import('@jest/types').Config.ConfigGlobals} ConfigGlobals */

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...base,
  ...mainBase,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: '<rootDir>/tests/coverage'
}
module.exports = config
