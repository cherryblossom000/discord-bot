import type {Command} from '../types'

const command: Command = {
  name: 'stats',
  aliases: ['statistics'],
  description: 'Gets my stats.',
  execute: async ({channel, client: {users, channels, guilds}}) => {
    await channel.send(`Users: ${users.cache.size}
Channels: ${channels.cache.size}
Guilds: ${guilds.cache.size}`)
  }
}
export default command
