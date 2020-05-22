import ms from 'ms'
import type {Command} from '../types'

const _: Command = {
  name: 'uptime',
  aliases: ['up'],
  description: 'Gets my uptime.',
  async execute({client, channel}) {
    await channel.send(`Uptime: ${ms(client.uptime!)}`)
  }
}
export default _
