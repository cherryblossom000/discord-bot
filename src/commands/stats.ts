import type {Message} from 'discord.js'
import type PinguCommand from '../types/PinguCommand'

const command: PinguCommand = {
  name: 'stats',
  aliases: ['statistics'],
  description: 'Gets my stats.',
  execute: (message: Message) => {
    const client = message.client
    message.channel.send(`Users: ${client.users.size}
Channels: ${client.channels.size}
Guilds: ${client.guilds.size}`)
  }
}

export default command
