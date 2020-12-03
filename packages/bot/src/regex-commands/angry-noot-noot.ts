import type {RegexCommand} from '../types'

const joinAlternate = (...strings: string[]): string =>
  `(?:${strings.join('|')})`

// pingu
const nouns = joinAlternate('bots?', 'pingu', 'communism', 'communists?')
// very
const adverbs = joinAlternate(
  'very',
  'much',
  'so',
  'too',
  'really',
  'big(?:gest)?'
)
// bad
const adjectives = joinAlternate(
  'down',
  'not working',
  'offline',
  'stupid',
  'sto{2,}pid',
  'dumb',
  'annoying',
  'bad',
  'worst',
  'frustrating',
  'sucks?',
  'flawed',
  'shit',
  'stinke?y',
  'po{2,}(?:p(?:ie)?)?',
  'crap',
  'fu+ck(?: (?:yo)?u)?'
)
// not (very) good | (very) bad
const bad = joinAlternate(
  adjectives,
  `${joinAlternate('not?', 'never')} ${adverbs}? ${joinAlternate(
    'good',
    'amazing',
    'great',
    'lovely',
    'fast',
    'awesome'
  )}`
)

// pingu (is) (a) (very) (bad | not (very) good)
const adjLast = `(?:${nouns} ${joinAlternate(
  'is',
  'are'
)}?(?: (?:an?|the))? ${adverbs}? ${bad})`
// bad pingu
const adjFirst = `(${bad} ${nouns})`
// bad pingu | pingu (is) (a) (very) (bad | not (very) good)
const regex = new RegExp(
  joinAlternate(adjLast, adjFirst).replace(/\s+/gu, '\\s*'),
  'ui'
)

const command: RegexCommand = {
  regex,
  regexMessage: 'Noot noot!'
}
export default command
