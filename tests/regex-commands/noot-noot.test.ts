import NootNoot from '../../src/regex-commands/noot-noot'
import testRegexCommand from './test-regex-command'

testRegexCommand('noot-noot', NootNoot, [
  'noot noot',
  'Noot Noot'
], [
  'not not',
  'noot'
])
