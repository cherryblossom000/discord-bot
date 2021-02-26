import ms from 'ms'
import type {AnyCommand} from '../types'

const command: AnyCommand = {
  name: 'uptime',
  aliases: ['up'],
  description: 'Gets my uptime.',
  async execute({client, channel}) {
    await channel.send(`Uptime: ${ms(client.uptime!)}`)
  }
}
export default command
