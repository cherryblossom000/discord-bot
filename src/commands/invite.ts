import {permissions} from '../constants'
import type PinguCommand from '../types/PinguCommand'

const command: PinguCommand = {
  name: 'invite',
  aliases: ['add', 'inv', 'link'],
  description: 'Gets my invite link.',
  execute: (message) => {
    message.channel.send(message.client.generateInvite(permissions))
  }
}

export default command
