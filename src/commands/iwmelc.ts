import {join} from 'path'
import {MessageAttachment} from 'discord.js'
import type {Command} from '../types'

export default {
  name: 'iwmelc',
  aliases: ['iwillmurdereverylastcapitalist'],
  description: 'Gets the meme that shows that \u{201c}noot noot\u{201d} in Pingu means \u{201c}i will murder every last ' +
    'capitalist\u{201d} in English.',
  execute: async message => {
    await message.channel.send(new MessageAttachment(join(__dirname, '../../assets/iwmelc.jpg')))
  }
} as Command
