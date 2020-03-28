import type {Command} from '../types'

const command: Command = {
  name: 'website',
  aliases: ['site', 'w', 'web'],
  description: 'Sends my website.',
  execute: async ({channel}) => {
    await channel.send('https://comrade-pingu.glitch.me')
  }
}
export default command
