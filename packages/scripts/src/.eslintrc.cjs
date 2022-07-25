'use strict'

/** @type {import('eslint').Linter.Config & {parserOptions?: import('@typescript-eslint/parser').ParserOptions}} */
module.exports = {
	overrides: [
		{
			files: '**/*.ts',
			extends: ['@cherryblossom/eslint-config/ts/node/esm'],
			rules: {
				'import/no-extraneous-dependencies': 0,
				'node/no-unpublished-import': 0,
				'node/no-extraneous-import': 0,
				'node/no-process-exit': 0
			}
		}
	]
}
