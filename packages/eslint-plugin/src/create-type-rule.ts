import {
	AST_NODE_TYPES,
	type TSESLint,
	type TSESTree
} from '@typescript-eslint/experimental-utils'

type ReportFn = (
	node: TSESTree.Comment | TSESTree.Node | TSESTree.Token
) => void

type DataFn<T> = (
	context: Readonly<TSESLint.RuleContext<'incorrectType', []>>
) => T
type ExtraValidator<T> = (
	typeAnnotation: TSESTree.TSTypeReference,
	report: ReportFn,
	data: T
) => void
export type CreateTypeRule = TSESLint.RuleModule<'incorrectType'>

const createTypeRule: {
	<T extends Record<string, unknown> | undefined = undefined>(
		variableName: string,
		typeName: string,
		typeMessage?: string,
		data?: DataFn<T>,
		extraValidation?: ExtraValidator<T>
	): CreateTypeRule
	<T extends Record<string, unknown> | undefined = undefined>(
		variableName: string,
		typeNames: Set<string>,
		typeMessage: string,
		data?: DataFn<T>,
		extraValidation?: ExtraValidator<T>
	): CreateTypeRule
} = <T extends Record<string, unknown> | undefined = undefined>(
	variableName: string,
	typeNames: Set<string> | string,
	typeMessage = `\`${typeNames as string}\``,
	getData?: (context: Readonly<TSESLint.RuleContext<'incorrectType', []>>) => T,
	validate?: (
		typeAnnotation: TSESTree.TSTypeReference,
		report: ReportFn,
		data: T
	) => void
): TSESLint.RuleModule<'incorrectType'> => {
	const isCorrectTypeName: (name: string) => boolean =
		typeof typeNames == 'string'
			? (name): boolean => name === typeNames
			: typeNames.has.bind(typeNames)
	return {
		meta: {
			type: 'problem',
			messages: {
				incorrectType: `The ${variableName} should have the type annotation ${typeMessage}.`
			},
			schema: []
		},
		create(context): TSESLint.RuleListener {
			const data = getData?.(context)
			const report: ReportFn = node =>
				context.report({
					node,
					messageId: 'incorrectType',
					...(getData ? {data} : {})
				})

			return {
				[`VariableDeclarator > Identifier[name=${variableName}]`](
					node: TSESTree.Identifier
				): void {
					const {typeAnnotation} = node
					if (!typeAnnotation) {
						report(node)
						return
					}

					if (
						typeAnnotation.typeAnnotation.type !==
						AST_NODE_TYPES.TSTypeReference
					) {
						report(typeAnnotation.typeAnnotation)
						return
					}

					if (
						typeAnnotation.typeAnnotation.typeName.type !==
							AST_NODE_TYPES.Identifier ||
						!isCorrectTypeName(typeAnnotation.typeAnnotation.typeName.name)
					) {
						report(typeAnnotation.typeAnnotation)
						return
					}

					if (validate) validate(typeAnnotation.typeAnnotation, report, data!)
				}
			}
		}
	}
}
export default createTypeRule
