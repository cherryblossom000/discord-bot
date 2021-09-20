import {basename} from 'node:path'
import {AST_NODE_TYPES} from '@typescript-eslint/experimental-utils'
import type {Linter} from 'eslint'
import defaultExportName from './rules/default-export-name.js'
import createTypeRule from './create-type-rule.js'

export const rules = {
  'correct-context-menu-command-type': createTypeRule(
    'command',
    new Set(['AnyContextMenuCommand', 'GuildOnlyContextMenuCommand']),
    '`AnyContextMenuCommand` or `GuildOnlyContextMenuCommand`'
  ),
  'correct-event-type': createTypeRule(
    'listener',
    'EventListener',
    "`EventListener<'{{event}}'>`",
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
  ),
  'correct-slash-command-type': createTypeRule(
    'command',
    new Set(['AnySlashCommand', 'GuildOnlySlashCommand']),
    '`AnySlashCommand` or `GuildOnlySlashCommand`'
  ),
  'correct-trigger-type': createTypeRule('command', 'Trigger'),
  'default-export-name': defaultExportName
}

export const configs: Record<string, Linter.Config> = {
  recommended: {
    plugins: ['@comrade-pingu'],
    overrides: [
      {
        files: ['src/commands/{context-menu,slash}/*.ts'],
        rules: {
          '@comrade-pingu/default-export-name': [1, {name: 'command'}]
        }
      },
      {
        files: ['src/commands/context-menu/*.ts'],
        rules: {
          '@comrade-pingu/correct-context-menu-command-type': 2
        }
      },
      {
        files: ['src/commands/slash/*.ts'],
        rules: {
          '@comrade-pingu/correct-slash-command-type': 2
        }
      },
      {
        files: ['src/triggers/*.ts'],
        rules: {
          '@comrade-pingu/correct-trigger-type': 2,
          '@comrade-pingu/default-export-name': [1, {name: 'trigger'}]
        }
      },
      {
        files: ['src/events/*.ts'],
        rules: {
          '@comrade-pingu/correct-event-type': 2,
          '@comrade-pingu/default-export-name': [1, {name: 'listener'}]
        }
      }
    ]
  }
}
