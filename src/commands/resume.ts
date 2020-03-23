import {emojis} from '../constants'
import {getQueue} from '../helpers'
import {hasPermissions} from '../helpers'
import type {Command} from '../types'

export default {
  name: 'resume',
  aliases: ['r', 'unpause'],
  description: 'Resumes the song currently playing.',
  guildOnly: true,
  execute: async message => {
    const queue = getQueue(message)
    if (!queue) return

    queue.connection.dispatcher.resume()
    if (hasPermissions(message, 'READ_MESSAGE_HISTORY')) await message.react(emojis.resume)
    else {
      await message.channel.send(`Resumed the music.
I can react on your message instead if you enable the READ_MESSAGE_HISTORY permission.`)
    }
  }
} as Command<true>
