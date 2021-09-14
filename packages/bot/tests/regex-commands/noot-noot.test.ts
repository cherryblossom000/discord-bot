import NootNoot from '../../src/regex-commands/noot-noot.js'
import testRegexCommand from './test-regex-command'

testRegexCommand(
  'noot-noot',
  NootNoot,
  ['noot noot', 'NOOOOT  noot'],
  ['not not', 'noot', 'nooot not']
)
