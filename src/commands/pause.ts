import {emojis} from '../constants'
import {getQueue, hasPermissions} from '../helpers'
import type {Command} from '../types'

const _: Command<true> = {
  name: 'pause',
  aliases: ['pa'],
  description: 'Pauses the song currently playing.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return

    queue.connection.dispatcher.pause()
    if (hasPermissions(message, 'READ_MESSAGE_HISTORY')) await message.react(emojis.pause)
    else {
      await message.channel.send(`Paused the music.
I can react on your message instead if you enable the READ_MESSAGE_HISTORY permission.`)
    }
  }
}
export default _
