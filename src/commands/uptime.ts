import ms from 'ms'
import type {Command} from '../types'

export default {
  name: 'uptime',
  aliases: ['u'],
  description: 'Gets my uptime.',
  execute: async ({channel, client}) => {
    await channel.send(`Uptime: ${ms(client.uptime!)}`)
  }
} as Command
