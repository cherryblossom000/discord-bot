import {imagesFolder} from '../constants.js'
import {checkPermissions} from '../utils.js'
import type {AnyCommand} from '../types'

const filePath = new URL('htkb.jpg', imagesFolder).pathname

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
