import type {Command} from '../types'

export default {
  name: 'stats',
  aliases: ['statistics'],
  description: 'Gets my stats.',
  execute: async ({channel, client: {users, channels, guilds}}) => {
    await channel.send(`Users: ${users.cache.size}
Channels: ${channels.cache.size}
Guilds: ${guilds.cache.size}`)
  }
} as Command
