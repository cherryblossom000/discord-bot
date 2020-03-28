import type {Command} from '../types'

const command: Command = {
  name: 'ping',
  aliases: ['p'],
  description: 'Gets my current latency.',
  cooldown: 5,
  execute: async message => {
    await message.channel.send(`Noot noot!
My current latency is ${new Date().getTime() - message.createdTimestamp} ms.`)
  }
}
export default command
