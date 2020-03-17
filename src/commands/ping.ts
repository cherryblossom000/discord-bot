import type {Command} from '../types'

export default {
  name: 'ping',
  aliases: ['p'],
  description: 'Gets my current latency.',
  cooldown: 5,
  execute: message => {
    message.channel.send(`Noot noot!
My current latency is ${new Date().getTime() - message.createdTimestamp} ms.`)
  }
} as Command
