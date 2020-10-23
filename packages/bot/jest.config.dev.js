'use strict'

const base = require('../../jest.config.dev')
const mainBase = require('./jest.config')

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  ...base,
  ...mainBase,
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'tests/coverage'
}
module.exports = config
