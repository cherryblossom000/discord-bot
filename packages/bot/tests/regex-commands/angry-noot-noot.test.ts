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
    'pingu is a bad',
    'pingu is a big poo',
    'pingu is the biggest poo',
    'pingu is the worst',
    'pingu is the worst not fast',
    'pingu pooo',
    'pingu poop',
    'pingu pooopie',
    'pingu stoopid',
    'pingu stooopid',
    'pingu stinky',
    'pingu stinkey',
    'bad pingu',
    'very bad pingu',
    'not good pingu',
    'fuck pingu',
    'fuck you pingu',
    'fuck u pingu',
    'pingu sucks',
    'pingu  really  sucks'
  ],
  [
    'good pingu',
    'pingu',
    'pingu is good',
    'pingu is very good',
    'pingu stopid',
    'pingu pop',
    'pingu is'
  ]
)
