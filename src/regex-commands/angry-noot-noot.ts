import type {RegexCommand} from '../types'

const joinAlternate = (...strings: string[]): string => `(${strings.join('|')})`

const nouns = joinAlternate(...[
  'bots?', 'pingu', 'communism', 'communists?'
])
const verbs = joinAlternate(...[
  'is', 'are'
])
const adverbs = joinAlternate(...[
  'very', 'much', 'so', 'too', 'really'
])
const adjectives = joinAlternate(...[
  'down', 'not working', 'offline', 'stupid', 'dumb', 'annoying', 'bad', 'frustrating', 'sucks?'
])
const negative = joinAlternate(...[
  'not?', 'never'
])
const good = joinAlternate(...[
  'good', 'amazing', 'great', 'lovely', 'fast'
])

const negativeGood = `${negative} ${adverbs}? ${good}`
const bad = joinAlternate(adjectives, negativeGood)

const adjLast = `${nouns} ${verbs}? ${adverbs}? ${bad}`
const adjFirst = `${bad} ${nouns}`
const regex = new RegExp(`(${adjLast})|(${adjFirst})`.replace(/\s+/ug, '\\s*'), 'ui')

const command: RegexCommand = {
  regex,
  regexMessage: 'Noot noot!'
}
export default command
