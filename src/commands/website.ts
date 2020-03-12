import type {Message} from 'discord.js'
import type {PinguCommand} from '../types'

export default {
  name: 'website',
  aliases: ['site', 'w', 'web'],
  description: 'Sends my website.',
  execute: (message: Message): void => {
    message.channel.send('https://comrade-pingu.glitch.me')
  }
} as PinguCommand
