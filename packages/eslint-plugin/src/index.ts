import {basename} from 'node:path'
import {
  AST_NODE_TYPES,
  // @ts-expect-error for inferred type of rules to be portable
  type TSESLint
} from '@typescript-eslint/experimental-utils'
import defaultExportName from './rules/default-export-name.js'
import createTypeRule, {type CreateTypeRule} from './create-type-rule.js'
import type {Linter} from 'eslint'

const createCommandTypeRule = (type: string): CreateTypeRule => {
  const anyType = `Any${type}`
  const guildOnlyType = `GuildOnly${type}`
  return createTypeRule(
    'command',
    new Set([anyType, guildOnlyType]),
    `\`${anyType}\` or \`${guildOnlyType}\``
  )
}

export const rules = {
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
  'correct-message-command-type': createCommandTypeRule(
    'MessageContextMenuCommand'
  ),
  'correct-slash-command-type': createCommandTypeRule('SlashCommand'),
  'correct-trigger-type': createTypeRule('command', 'Trigger'),
  'correct-user-command-type': createCommandTypeRule('UserContextMenuCommand'),
  'default-export-name': defaultExportName
}

export const configs: Record<string, Linter.Config> = {
  recommended: {
    plugins: ['@comrade-pingu'],
    overrides: [
      {
        files: ['src/commands/{message,slash,user}/*.ts'],
        rules: {
          '@comrade-pingu/default-export-name': [1, {name: 'command'}]
        }
      },
      {
        files: ['src/commands/message/*.ts'],
        rules: {
          '@comrade-pingu/correct-message-command-type': 2
        }
      },
      {
        files: ['src/commands/slash/*.ts'],
        rules: {
          '@comrade-pingu/correct-slash-command-type': 2
        }
      },
      {
        files: ['src/commands/user/*.ts'],
        rules: {
          '@comrade-pingu/correct-user-command-type': 2
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
