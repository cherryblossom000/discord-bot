import {version} from '../../package.json'
import type {Command} from '../types'

export default {
  name: 'info',
  aliases: ['in'],
  description: 'Gets info about me.',
  execute: async message => {
    await message.channel.send(`Version: \`${version}\`
I am comrade Pingu. Noot noot.
Kill all the capitalist scum! For those who don\u2019t know, that includes Michael Sun because he killed Steffi\u2019s` +
` ant friends.
I was created by cherryblossom#2661.`)
  }
} as Command
