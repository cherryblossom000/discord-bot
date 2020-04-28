import {permissions} from '../constants'
import type {Command} from '../types'

const _: Command = {
  name: 'invite',
  aliases: ['add', 'inv', 'link'],
  description: 'Gets my invite link.',
  async execute({client, channel}) {
    await channel.send(await client.generateInvite(permissions))
  }
}
export default _
