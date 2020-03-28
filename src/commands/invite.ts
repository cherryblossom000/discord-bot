import {permissions} from '../constants'
import type {Command} from '../types'

const command: Command = {
  name: 'invite',
  aliases: ['add', 'inv', 'link'],
  description: 'Gets my invite link.',
  execute: async message => {
    await message.channel.send(await message.client.generateInvite(permissions))
  }
}
export default command
