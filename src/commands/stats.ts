import type {Command} from '../types'

const _: Command = {
  name: 'stats',
  aliases: ['statistics'],
  description: 'Gets my stats.',
  async execute({channel, client: {channels, guilds, users}}) {
    await channel.send(`Users: ${users.cache.size}
Channels: ${channels.cache.size}
Guilds: ${guilds.cache.size}`)
  }
}
export default _
