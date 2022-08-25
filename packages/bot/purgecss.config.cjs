'use strict'

/* eslint-disable jsdoc/valid-types -- valid */
/** @type {Exclude<Parameters<import('purgecss').PurgeCSS['purge']>[0], string | undefined>} */
/* eslint-enable jsdoc/valid-types */
const config = {
	content: ['dist/assets/html/*.html'],
	css: ['assets/css/*.css']
}
module.exports = config
