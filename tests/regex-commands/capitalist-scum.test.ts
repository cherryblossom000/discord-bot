import CapitalistScum from '../../src/regex-commands/capitalist-scum'
import testRegexCommand from './test-regex-command'

testRegexCommand('capitalist-scum', CapitalistScum, [
  'capitalism',
  'capitalist',
  'elon',
  'musk'
], [
  'capital'
])
