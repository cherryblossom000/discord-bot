import {permissions} from '../constants.js'
import type {AnyCommand} from '../types'

const command: AnyCommand = {
  name: 'invite',
  aliases: ['add', 'inv', 'link'],
  description: 'Gets my invite link.',
  async execute({client, channel}) {
    await channel.send(await client.generateInvite(permissions))
  }
}
export default command
