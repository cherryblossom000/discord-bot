'use strict'

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  plugins: ['@comrade-pingu'],
  rules: {
    'breaking-change-exclamation-mark': [2, 'always'],
    'breaking-change-footer': [2, 'always']
  }
}
module.exports = config
