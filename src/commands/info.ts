import {version} from '../../package.json'
import type {Message} from 'discord.js'
import type PinguCommand from '../types/PinguCommand'

const command: PinguCommand = {
  name: 'info',
  aliases: ['in'],
  description: 'Gets info about me.',
  execute: (message: Message): void => {
    message.channel.send(`Version: \`${version}\`
I am comrade Pingu. Noot noot.
Kill all the capitalist scum! For those who don\u{2019}t know, that includes Michael Sun because he killed Steffi\u{2019}s` +
` ant friends.
I was created by cherryblossom#2661.`)
  }
}

export default command
