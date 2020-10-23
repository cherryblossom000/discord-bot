import {AST_NODE_TYPES} from '@typescript-eslint/experimental-utils'
import type {TSESLint, TSESTree} from '@typescript-eslint/experimental-utils'

export default (
  name: string
): TSESLint.RuleModule<'incorrectName' | 'wrongExport', []> => ({
  meta: {
    type: 'suggestion',
    messages: {
      incorrectName: `\`{{name}}\` should be \`${name}\`.`,
      wrongExport: `An identifier called \`${name}\` should be the default export.`
    },
    schema: []
  },
  create(context): TSESLint.RuleListener {
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
            data: {name: declaration.name}
          })
        }
      },
      'Program:not(:has(ExportDefaultDeclaration))'(
        node: TSESTree.Program
      ): void {
        context.report({node, messageId: 'wrongExport'})
      }
    }
  }
})
