import type {Command} from '../types'

const _: Command = {
  name: 'website',
  aliases: ['site', 'w', 'web'],
  description: 'Sends my website.',
  async execute({channel}) {
    await channel.send('https://comrade-pingu.glitch.me')
  }
}
export default _
