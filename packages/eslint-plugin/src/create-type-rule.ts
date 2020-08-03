import {AST_NODE_TYPES} from '@typescript-eslint/experimental-utils'
import type {TSESLint, TSESTree} from '@typescript-eslint/experimental-utils'

type ReportFn = (
  node: TSESTree.Node | TSESTree.Comment | TSESTree.Token
) => void

export default <T extends Record<string, unknown> | undefined = undefined>(
  variableName: string,
  typeName: string,
  typeMessage = typeName,
  data?: (context: Readonly<TSESLint.RuleContext<'incorrectType', []>>) => T,
  extraValidation?: (
    typeAnnotation: TSESTree.TSTypeReference,
    report: ReportFn,
    data: T
  ) => void
): TSESLint.RuleModule<'incorrectType', []> => ({
  meta: {
    type: 'problem',
    messages: {
      incorrectType: `The ${variableName} should have the type annotation \`${typeMessage}\`.`
    },
    schema: []
  },
  create(context): TSESLint.RuleListener {
    const _data = data?.(context) as T
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
          typeAnnotation.typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference
        ) {
          report(typeAnnotation.typeAnnotation)
          return
        }

        if (
          typeAnnotation.typeAnnotation.typeName.type !==
            AST_NODE_TYPES.Identifier ||
          typeAnnotation.typeAnnotation.typeName.name !== typeName
        ) {
          report(typeAnnotation.typeAnnotation)
          return
        }

        if (extraValidation)
          extraValidation(typeAnnotation.typeAnnotation, report, _data)
      }
    }
  }
})
