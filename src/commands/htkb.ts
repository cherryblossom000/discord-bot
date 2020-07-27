import {join} from 'path'
import {MessageAttachment} from 'discord.js'
import {checkPermissions} from '../utils'
import type {Command} from '../types'

const command: Command = {
  name: 'htkb',
  aliases: ['howtokissboy'],
  description: 'Gets the image that shows how to kiss a boy.',
  async execute(message) {
    if (message.guild && !await checkPermissions(message, 'ATTACH_FILES')) return
    await message.channel.send(new MessageAttachment(join(__dirname, '../../assets/img/htkb.png')))
  }
}
export default command
