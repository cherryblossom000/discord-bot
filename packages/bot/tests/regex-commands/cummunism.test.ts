import Cummunism from '../../src/regex-commands/cummunism.js'
import testRegexCommand from './test-regex-command'

testRegexCommand(
  'cummunism',
  Cummunism,
  ['cummunism', 'CUMMunISM', 'cummunist'],
  ['capitalism', 'capitalist', 'cum']
)
