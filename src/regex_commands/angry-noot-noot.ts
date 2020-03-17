import type {RegexCommand} from '../types'

const joinAlternate = (...strings: string[]): string => `(${strings.join('|')})`,

  nouns = joinAlternate(...[
    'bots?', 'pingu', 'communism', 'communists?'
  ]),
  verbs = joinAlternate(...[
    'is', 'are'
  ]),
  adverbs = joinAlternate(...[
    'very', 'much', 'so', 'too'
  ]),
  adjectives = joinAlternate(...[
    'down', 'not working', 'offline', 'stupid', 'dumb', 'annoying', 'bad', 'frustrating', 'sucks?'
  ]),
  negative = joinAlternate(...[
    'not?', 'never'
  ]),
  good = joinAlternate(...[
    'good', 'amazing', 'great', 'lovely', 'fast'
  ]),

  negativeGood = `${negative} ${adverbs}? ${good}`,
  bad = joinAlternate(adjectives, negativeGood),

  adjLast = `${nouns} ${verbs}? ${adverbs}? ${bad}`,
  adjFirst = `${bad} ${nouns}`,
  regex = new RegExp(`(${adjLast})|(${adjFirst})`.replace(/\s+/g, '\\s*'), 'i')

export default {
  regex,
  regexMessage: 'Noot noot!'
} as RegexCommand
