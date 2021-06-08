import {readdirSync} from 'fs'
import * as path from 'path'
import type {Linter, Rule} from 'eslint'

const rulesFolder = path.join(__dirname, 'rules')

export const rules = Object.fromEntries(
  readdirSync(path.join(__dirname, 'rules'))
    .filter(file => file.endsWith('.js'))
    .map(file => [
      file.slice(0, -3),
      // eslint-disable-next-line @typescript-eslint/no-require-imports, node/global-require -- needs to be synchronous
      require(path.join(rulesFolder, file)) as Rule.RuleModule
    ])
)

export const configs: Record<string, Linter.Config> = {
  recommended: {
    plugins: ['@comrade-pingu'],
    overrides: [
      {
        files: ['src/commands/*.ts'],
        rules: {
          '@comrade-pingu/correct-command-type': 2,
          '@comrade-pingu/command-export-name': 1
        }
      },
      {
        files: ['src/regex-commands/*.ts'],
        rules: {
          '@comrade-pingu/correct-regex-command-type': 2,
          '@comrade-pingu/command-export-name': 1
        }
      },
      {
        files: ['src/events/*.ts'],
        rules: {
          '@comrade-pingu/correct-event-type': 2,
          '@comrade-pingu/event-export-name': 1
        }
      }
    ]
  }
}
