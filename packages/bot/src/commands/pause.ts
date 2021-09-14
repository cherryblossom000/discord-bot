import {emojis} from '../constants.js'
import {getQueue, hasPermissions} from '../utils.js'
import type {GuildOnlyCommand} from '../types'

const command: GuildOnlyCommand = {
  name: 'pause',
  aliases: ['pa'],
  description: 'Pauses the song currently playing.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return

    queue.connection.dispatcher.pause()
    await (hasPermissions(message, 'READ_MESSAGE_HISTORY')
      ? message.react(emojis.pause)
      : message.channel.send(`Paused the music.
I can react on your message instead if you enable the READ_MESSAGE_HISTORY permission.`))
  }
}
export default command
