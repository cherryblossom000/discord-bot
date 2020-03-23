import {join} from 'path'
import {MessageAttachment} from 'discord.js'
import {checkPermissions} from '../helpers'
import type {Command} from '../types'

export default {
  name: 'iwmelc',
  aliases: ['iwillmurdereverylastcapitalist'],
  description: 'Gets the meme that shows that \u2018noot noot\u2019 in Pingu means \u2018i will murder every last ' +
    'capitalist\u2019 in English.',
  execute: async message => {
    if (message.guild && !checkPermissions(message, 'ATTACH_FILES')) return
    await message.channel.send(new MessageAttachment(join(__dirname, '../../assets/img/iwmelc.jpg')))
  }
} as Command
