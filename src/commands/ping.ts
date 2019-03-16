import type {Message} from 'discord.js'
import type PinguCommand from '../types/PinguCommand'

const command: PinguCommand = {
  name: 'ping',
  aliases: ['p'],
  description: 'Gets my current latency.',
  cooldown: 5,
  execute: (message: Message) => {
    message.channel.send(`Noot noot!
My current latency is ${new Date().getTime() - message.createdTimestamp} ms.`)
  }
}

export default command
