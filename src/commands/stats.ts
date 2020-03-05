import type {Message} from 'discord.js'
import type {PinguCommand} from '../types'

export default {
  name: 'stats',
  aliases: ['statistics'],
  description: 'Gets my stats.',
  execute: (message: Message) => {
    const client = message.client
    message.channel.send(`Users: ${client.users.cache.size}
Channels: ${client.channels.cache.size}
Guilds: ${client.guilds.cache.size}`)
  }
} as PinguCommand
