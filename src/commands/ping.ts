import type {Command} from '../types'

const _: Command = {
  name: 'ping',
  aliases: ['p'],
  description: 'Gets my current latency.',
  cooldown: 5,
  async execute({channel, createdTimestamp}) {
    await channel.send(`Noot noot!
My current latency is ${Date.now() - createdTimestamp} ms.`)
  }
}
export default _
