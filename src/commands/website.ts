import type {Command} from '../types'

export default {
  name: 'website',
  aliases: ['site', 'w', 'web'],
  description: 'Sends my website.',
  execute: message => {
    message.channel.send('https://comrade-pingu.glitch.me')
  }
} as Command
