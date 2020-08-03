import {basename} from 'path'
import {AST_NODE_TYPES} from '@typescript-eslint/experimental-utils'
import createTypeRule from '../create-type-rule'

// TODO [eslint-plugin-import@>2.22.0]: Refactor to export = createTypeRule(...)
const rule = createTypeRule(
  'listener',
  'EventListener',
  "EventListener<'{{event}}'>",
  context => ({event: basename(context.getFilename().slice(0, -3))}),
  (typeAnnotation, report, {event}) => {
    const {typeParameters} = typeAnnotation
    const typeParam = typeParameters?.params[0]
    if (!typeParam) {
      report(typeAnnotation)
      return
    }
    if (
      typeParam.type !== AST_NODE_TYPES.TSLiteralType ||
      typeParam.literal.type !== AST_NODE_TYPES.Literal ||
      typeParam.literal.value !== event
    )
      report(typeParam)
  }
)
export = rule
