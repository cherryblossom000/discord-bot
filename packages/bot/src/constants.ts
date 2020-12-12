import type {PermissionString} from 'discord.js'

/** The prefix for the bot. */
export const defaultPrefix = '.'

/** The permissions needed for the bot to work fully. */
export const permissions: PermissionString[] = [
  'VIEW_CHANNEL',
  'SEND_MESSAGES',
  // To remove other users' reactions
  'MANAGE_MESSAGES',
  'EMBED_LINKS',
  'ATTACH_FILES',
  // To react on a message
  'READ_MESSAGE_HISTORY',
  'ADD_REACTIONS',
  'CONNECT',
  'SPEAK'
]

/** The user id of the creator, cherryblossom. */
export const me = '506054261717598210'

const numbers = []
for (let i = 0; i <= 9; i++) numbers.push(`${i}\uFE0F\u20E3`)
numbers.push('🔟')

/** Emojis. */
export const emojis = {
  left: '⬅',
  right: '➡',
  pause: '⏸',
  resume: '▶',
  stop: '🛑',
  numbers,
  delete: '🗑',
  letters: ['🇦', '🇧', '🇨', '🇩'],
  tick: '✅',
  cross: '❌',
  clock: '🕒',
  smirk: '😏'
} as const

export const defaultTimeZone = 'UTC'

// #region Angry Noot Noot

export const pinguNouns = [
  'bots?',
  'pingu',
  'communism',
  'communists?',
  'stalin',
  'ussr',
  'union of soviet socialist republics',
  'soviet(?: union)?'
]
export const copulas = ['is', 'are']
export const articles = ['an?', 'the']
export const adverbs = ['very', 'much', 'so', 'too', 'really', 'big(?:gest)?']
export const badAdjectives = [
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
]
export const negative = ['not?', 'never']
export const goodAdjectives = [
  'good',
  'amazing',
  'great',
  'lovely',
  'fast',
  'awesome'
]

// #endregion
