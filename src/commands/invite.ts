import {permissions} from '../constants'
import type {Command} from '../types'

export default {
  name: 'invite',
  aliases: ['add', 'inv', 'link'],
  description: 'Gets my invite link.',
  execute: message => {
    message.channel.send(message.client.generateInvite(permissions))
  }
} as Command
