import type {Message} from 'discord.js'
import type PinguRegexCommand from '../types/PinguRegexCommand'

const config = {
  nouns: ['bots?', 'pingu', 'communism', 'communists?'],
  verbs: ['is', 'are'],
  adverbs: ['very', 'much', 'so', 'too'],
  adjectives: ['down', 'not working', 'offline', 'stupid', 'dumb', 'annoying', 'bad', 'frustrating', 'sucks?'],
  negative: ['not', 'no'],
  good: ['good', 'amazing', 'great', 'lovely', 'fast']
}

const command: PinguRegexCommand = {
  execute: (message: Message) => {
    const {content, channel} = message
    const nounsRegex = new RegExp(config.nouns.join('|').replace(/\s+/, '\\s*'), 'iu')

    if (nounsRegex.test(content)) {
      const joinAlternate = (...strings: string[]): string => `(${strings.join('|')})`
      const joinInParens = (...strings: string[]): string => `(${strings.join('')})`
      const replaceSpaces = (string: string): string => string.replace(/s+/g, '\\s*')

      const nouns = joinAlternate(...config.nouns)
      const verbs = joinAlternate(...config.verbs)
      const adverbs = joinAlternate(...config.adverbs)
      const adjectives = joinAlternate(...config.adjectives)
      const negative = joinAlternate(...config.negative)
      const good = joinAlternate(...config.good)

      const negativeGood = joinInParens(negative, `${adverbs}?`, good)
      const bad = joinAlternate(adjectives, negativeGood)

      const adjLast = replaceSpaces(`${nouns} ${verbs}? ${adverbs}? ${bad}`)
      const adjFirst = replaceSpaces(`${bad} ${nouns} ${verbs}? ${adverbs}? ${bad}?`)
      const regex = new RegExp(`(${adjLast})|(${adjFirst})`, 'i')

      if (regex.test(content)) channel.send('Noot noot!')
      else if (/pingu/iu.test(content)) channel.send('Did someone mention me?')
    }
  }
}

export default command
