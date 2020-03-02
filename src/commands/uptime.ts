import ms from 'ms'
import type {Message} from 'discord.js'
import type PinguCommand from '../types/PinguCommand'

const command: PinguCommand = {
  name: 'uptime',
  aliases: ['u'],
  description: 'Gets my uptime.',
  execute: (message: Message) => {
    message.channel.send(`Uptime: ${ms(message.client.uptime!)}`)
  }
}

export default command
