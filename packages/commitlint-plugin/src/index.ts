import type {Plugin, RuleOutcome} from '@commitlint/types'

const success: RuleOutcome = [true]
const failure = (message: string): RuleOutcome => [false, message]

const hasExclamationMark = (header: string): boolean =>
  /^\w*\(.*\)!: .*$/u.test(header)

const isBreakingChange = (footer: string | null): boolean =>
  footer?.startsWith('BREAKING CHANGE:') ?? false

const plugin: Plugin = {
  rules: {
    'breaking-change-exclamation-mark'({header, footer}, when): RuleOutcome {
      if (isBreakingChange(footer)) {
        const hasExclMark = hasExclamationMark(header)
        if (when === 'always' && !hasExclMark) {
          return failure(
            'breaking changes must have an exclamation mark after the type/scope'
          )
        }
        if (when === 'never' && hasExclMark) {
          return failure(
            'breaking changes must not have an exclamation mark after the type/scope'
          )
        }
      }
      return success
    },
    'breaking-change-footer'({header, footer}, when): RuleOutcome {
      if (hasExclamationMark(header)) {
        const isBreaking = isBreakingChange(footer)
        if (when === 'always' && !isBreaking) {
          return failure(
            'breaking changes must include a BREAKING CHANGE footer'
          )
        }
        if (when === 'never' && isBreaking) {
          return failure(
            'breaking changes must not include a BREAKING CHANGE footer'
          )
        }
      }
      return success
    }
  }
}
export = plugin
