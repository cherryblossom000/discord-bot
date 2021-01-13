import path from 'path'
import {imagesFolder} from '../constants'
import {checkPermissions} from '../utils'
import type {Command} from '../types'

const filePath = path.join(imagesFolder, 'iwmelc.jpg')

const command: Command = {
  name: 'iwmelc',
  aliases: ['iwillmurdereverylastcapitalist'],
  description:
    'Gets the meme that shows that ‘noot noot’ in Pingu means ‘i will murder every last capitalist’ in English.',
  async execute(message) {
    if (message.guild && !(await checkPermissions(message, 'ATTACH_FILES')))
      return
    await message.channel.send({files: [filePath]})
  }
}
export default command
