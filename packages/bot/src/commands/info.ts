import {version} from '../../package.json'
import type {AnyCommand} from '../types'

const command: AnyCommand = {
  name: 'info',
  aliases: ['in'],
  description: 'Gets info about me.',
  async execute({channel}) {
    await channel.send(`Version: \`${version}\`
I am comrade Pingu. Noot noot.
Kill all the capitalist scum!.
I was created by cherryblossom#2661.`)
  }
}
export default command
