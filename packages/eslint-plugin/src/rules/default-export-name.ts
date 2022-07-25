import {
	AST_NODE_TYPES,
	type TSESLint,
	type TSESTree
} from '@typescript-eslint/experimental-utils'

const rule: TSESLint.RuleModule<
	'incorrectName' | 'wrongExport',
	[{name: string}]
> = {
	meta: {
		type: 'suggestion',
		messages: {
			incorrectName: '`{{actual}}` should be `{{expected}}`.',
			wrongExport:
				'An identifier called `{{expected}}` should be the default export.'
		},
		schema: [
			{properties: {name: {type: 'string'}}, additionalProperties: false}
		]
	},
	create(context): TSESLint.RuleListener {
		const [{name}] = context.options
		return {
			ExportDefaultDeclaration({declaration}): void {
				if (declaration.type !== AST_NODE_TYPES.Identifier) {
					context.report({node: declaration, messageId: 'wrongExport'})
					return
				}

				if (declaration.name !== name) {
					context.report({
						node: declaration,
						messageId: 'incorrectName',
						data: {actual: declaration.name, expected: name}
					})
				}
			},
			'Program:not(:has(ExportDefaultDeclaration))'(
				node: TSESTree.Program
			): void {
				context.report({node, messageId: 'wrongExport', data: {expected: name}})
			}
		}
	}
}
export default rule
