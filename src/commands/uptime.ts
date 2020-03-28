import ms from 'ms'
import type {Command} from '../types'

const command: Command = {
  name: 'uptime',
  aliases: ['u'],
  description: 'Gets my uptime.',
  execute: async ({channel, client}) => {
    await channel.send(`Uptime: ${ms(client.uptime!)}`)
  }
}
export default command
