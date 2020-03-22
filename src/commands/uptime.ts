import ms from 'ms'
import type {Command} from '../types'

export default {
  name: 'uptime',
  aliases: ['u'],
  description: 'Gets my uptime.',
  execute: async message => {
    await message.channel.send(`Uptime: ${ms(message.client.uptime!)}`)
  }
} as Command
