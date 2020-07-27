import {join} from 'path'
import {MessageAttachment} from 'discord.js'
import {checkPermissions} from '../utils'
import type {Command} from '../types'

const command: Command = {
  name: 'iwmelc',
  aliases: ['iwillmurdereverylastcapitalist'],
  description: 'Gets the meme that shows that ‘noot noot’ in Pingu means ‘i will murder every last capitalist’ in English.',
  async execute(message) {
    if (message.guild && !await checkPermissions(message, 'ATTACH_FILES')) return
    await message.channel.send(new MessageAttachment(join(__dirname, '../../assets/img/iwmelc.jpg')))
  }
}
export default command
