import {emojis} from '../constants'
import {getQueue, hasPermissions} from '../helpers'
import type {Command} from '../types'

const _: Command<true> = {
  name: 'stop',
  aliases: ['s'],
  description: 'Stops playing music.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return

    queue.voiceChannel.leave()
    message.client.queues.delete(message.guild.id)
    if (hasPermissions(message, 'READ_MESSAGE_HISTORY')) await message.react(emojis.stop)
    else {
      await message.channel.send(`Stopped the music.
I can react on your message instead if you enable the READ_MESSAGE_HISTORY permission.`)
    }
  }
}
export default _
