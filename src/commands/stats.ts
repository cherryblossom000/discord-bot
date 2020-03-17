import type {Command} from '../types'

export default {
  name: 'stats',
  aliases: ['statistics'],
  description: 'Gets my stats.',
  execute: message => {
    const client = message.client
    message.channel.send(`Users: ${client.users.cache.size}
Channels: ${client.channels.cache.size}
Guilds: ${client.guilds.cache.size}`)
  }
} as Command
