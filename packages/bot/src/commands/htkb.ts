import path from 'path'
import {imagesFolder} from '../constants'
import {checkPermissions} from '../utils'
import type {AnyCommand} from '../types'

const filePath = path.join(imagesFolder, 'htkb.jpg')

const command: AnyCommand = {
  name: 'htkb',
  aliases: ['howtokissboy'],
  description: 'Gets the image that shows how to kiss a boy.',
  async execute(message) {
    if (message.guild && !(await checkPermissions(message, 'ATTACH_FILES')))
      return
    await message.channel.send({files: [filePath]})
  }
}
export default command
