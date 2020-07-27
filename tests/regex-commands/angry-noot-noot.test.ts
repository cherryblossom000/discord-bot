import AngryNootNoot from '../../src/regex-commands/angry-noot-noot'
import testRegexCommand from './test-regex-command'

testRegexCommand(
  'angry-noot-noot',
  AngryNootNoot,
  [
    'pingu is bad',
    'pingu bad',
    'pingu is very bad',
    'pingu is not good',
    'pingu is not very good',
    'bad pingu',
    'very bad pingu',
    'not good pingu',
    'pingu sucks',
    'pingu  really  sucks'
  ],
  ['good pingu', 'pingu', 'pingu is good', 'pingu is very good']
)
