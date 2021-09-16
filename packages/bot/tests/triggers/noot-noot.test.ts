import NootNoot from '../../src/triggers/noot-noot.js'
import testTrigger from './test-trigger'

testTrigger(
  'noot-noot',
  NootNoot,
  ['noot noot', 'NOOOOT  noot'],
  ['not not', 'noot', 'nooot not']
)
