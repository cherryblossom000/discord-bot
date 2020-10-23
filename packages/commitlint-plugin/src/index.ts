import type {Plugin, RuleOutcome} from '@commitlint/types'

const success: RuleOutcome = [true]
const failure = (message: string): RuleOutcome => [false, message]

const hasExclamationMark = (header: string): boolean =>
  /^\w*\(.*\)!: .*$/u.test(header)

const plugin: Plugin = {
  rules: {
    'breaking-change-exclamation-mark'({header, footer}, when): RuleOutcome {
      const hasExclMark = hasExclamationMark(header)
      if (footer !== null) {
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
        if (when === 'always' && footer === null) {
          return failure(
            'breaking changes must include a BREAKING CHANGE footer'
          )
        }
        if (when === 'never' && footer !== null) {
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
