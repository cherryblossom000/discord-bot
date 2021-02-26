import {AST_NODE_TYPES} from '@typescript-eslint/experimental-utils'
import type {TSESLint, TSESTree} from '@typescript-eslint/experimental-utils'

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
type CreateTypeRule = TSESLint.RuleModule<'incorrectType', []>

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
  data?: (context: Readonly<TSESLint.RuleContext<'incorrectType', []>>) => T,
  extraValidation?: (
    typeAnnotation: TSESTree.TSTypeReference,
    report: ReportFn,
    data: T
  ) => void
): TSESLint.RuleModule<'incorrectType', []> => {
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
      const _data = data?.(context)
      const report: ReportFn = node =>
        context.report({
          node,
          messageId: 'incorrectType',
          ...(data ? {data: _data} : {})
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

          if (extraValidation)
            extraValidation(typeAnnotation.typeAnnotation, report, _data!)
        }
      }
    }
  }
}
export default createTypeRule
