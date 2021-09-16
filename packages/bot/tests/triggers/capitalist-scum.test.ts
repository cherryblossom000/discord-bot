import CapitalistScum from '../../src/triggers/capitalist-scum.js'
import testTrigger from './test-trigger'

testTrigger(
  'capitalist-scum',
  CapitalistScum,
  [
    'capitalism',
    'capitalist',
    'elon',
    'elons',
    'elonsss',
    'melon',
    'watermelon',
    'musk',
    'bourgeois',
    'bourgeoisie'
  ],
  ['capital', 'belong']
)
