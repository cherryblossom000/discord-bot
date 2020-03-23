import type {Command} from '../types'

export default {
  name: 'website',
  aliases: ['site', 'w', 'web'],
  description: 'Sends my website.',
  execute: async ({channel}) => {
    await channel.send('https://comrade-pingu.glitch.me')
  }
} as Command
