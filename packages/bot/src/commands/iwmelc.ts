import {imagesFolder} from '../constants.js'
import {checkPermissions} from '../utils.js'
import type {AnyCommand} from '../types'

const filePath = new URL('iwmelc.jpg', imagesFolder).pathname

const command: AnyCommand = {
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
