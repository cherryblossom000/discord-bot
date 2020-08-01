import type {Command} from '../types'

const command: Command = {
  name: 'website',
  aliases: ['site', 'w', 'web'],
  description: 'Sends my website.',
  async execute({channel}) {
    await channel.send('https://comrade-pingu--cherryblossom00.repl.co')
  }
}
export default command
