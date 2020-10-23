'use strict'

/** @type {Exclude<Parameters<import('purgecss').PurgeCSS['purge']>[0], string | undefined>} */
const config = {
  content: ['dist/assets/html/*.html'],
  css: ['assets/css/*.css']
}
module.exports = config
