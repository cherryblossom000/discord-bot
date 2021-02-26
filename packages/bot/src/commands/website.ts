import type {AnyCommand} from '../types'

const command: AnyCommand = {
  name: 'website',
  aliases: ['site', 'w', 'web'],
  description: 'Sends my website.',
  async execute({channel}) {
    await channel.send('https://comrade-pingu--cherryblossom00.repl.co')
  }
}
export default command
