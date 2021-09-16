import {
  adverbs as _adverbs,
  articles,
  badAdjectives,
  copulas,
  goodAdjectives,
  negative,
  pinguNouns
} from '../constants.js'
import type {Trigger} from '../types'

const alternate = (strings: readonly string[]): string =>
  `(?:${strings.join('|')})`

/** Like `alternate`, but with a spread argument (hence the `S` suffix). */
const alternateS = (...strings: string[]): string => alternate(strings)

// pingu
const nouns = alternate(pinguNouns)
// very
const adverbs = alternate(_adverbs)
// bad
const adjectives = alternate(badAdjectives)
// not (very) good | (very) bad
const bad = alternateS(
  adjectives,
  `${alternate(negative)} ${adverbs}? ${alternate(goodAdjectives)}`
)

// pingu (is) (a) (very) (bad | not (very) good)
const adjLast = `(?:${nouns} ${alternate(copulas)}?(?: (?:${alternate(
  articles
)}))? ${adverbs}? ${bad})`
// bad pingu
const adjFirst = `(${bad} ${nouns})`
// bad pingu | pingu (is) (a) (very) (bad | not (very) good)
const regex = new RegExp(
  alternateS(adjLast, adjFirst).replace(/\s+/gu, '\\s*'),
  'ui'
)

const trigger: Trigger = {
  regex,
  message: 'Noot noot!'
}
export default trigger
