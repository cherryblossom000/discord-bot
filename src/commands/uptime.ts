import ms from 'ms'
import type {Message} from 'discord.js'
import type {PinguCommand} from '../types'

export default {
  name: 'uptime',
  aliases: ['u'],
  description: 'Gets my uptime.',
  execute: (message: Message) => {
    message.channel.send(`Uptime: ${ms(message.client.uptime!)}`)
  }
} as PinguCommand
