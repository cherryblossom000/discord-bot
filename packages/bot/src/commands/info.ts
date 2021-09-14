import {readFile} from 'node:fs/promises'
import type {AnyCommand} from '../types'
// eslint-disable-next-line node/no-unpublished-import -- types
import type {PackageJson} from 'type-fest'

const {version} = JSON.parse(
  await readFile(
    new URL('../../package.json', import.meta.url).pathname,
    'utf8'
  )
) as PackageJson

const command: AnyCommand = {
  name: 'info',
  aliases: ['in'],
  description: 'Gets info about me.',
  async execute({channel}) {
    await channel.send(`Version: \`${version}\`
I am comrade Pingu. Noot noot.
Kill all the capitalist scum!
I was created by cherryblossom#2661.`)
  }
}
export default command
