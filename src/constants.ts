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
for (let i = 0; i <= 9; i++) numbers.push(`${i}\ufe0f\u20e3`)
numbers.push('\u{1f51f}')

/** Emojis. */
export const emojis = {
  left: '\u2b05',
  right: '\u27a1',
  pause: '\u23f8',
  resume: '\u25b6',
  stop: '\u{1f6d1}',
  numbers,
  delete: '\u{1f5d1}'
} as const
