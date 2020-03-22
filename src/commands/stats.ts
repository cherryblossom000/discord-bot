import type {Command} from '../types'

export default {
  name: 'stats',
  aliases: ['statistics'],
  description: 'Gets my stats.',
  execute: async message => {
    const client = message.client
    await message.channel.send(`Users: ${client.users.cache.size}
Channels: ${client.channels.cache.size}
Guilds: ${client.guilds.cache.size}`)
  }
} as Command
