import type {Command} from '../types'

const command: Command = {
  name: 'ping',
  aliases: ['p'],
  description: 'Gets my current latency.',
  cooldown: 5,
  async execute({channel, client, createdTimestamp}) {
    const msg = await channel.send('Pinging…')
    await msg.edit(`Noot noot!
Latency: ${msg.createdTimestamp - createdTimestamp} ms
Websocket: ${client.ws.ping} ms`)
  }
}
export default command
