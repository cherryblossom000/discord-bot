import {join} from 'path'
import {MessageAttachment} from 'discord.js'
import {checkPermissions} from '../helpers'
import type {Command, GuildMessage} from '../types'

export default {
  name: 'iwmelc',
  aliases: ['iwillmurdereverylastcapitalist'],
  description: 'Gets the meme that shows that \u201cnoot noot\u201d in Pingu means \u201ci will murder every last ' +
    'capitalist\u201d in English.',
  execute: async message => {
    if (message.guild && !checkPermissions(message as GuildMessage, 'ATTACH_FILES')) return
    await message.channel.send(new MessageAttachment(join(__dirname, '../../assets/img/iwmelc.jpg')))
  }
} as Command
