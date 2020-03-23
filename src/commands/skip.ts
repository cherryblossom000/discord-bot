import {getQueue} from '../helpers'
import type {Command} from '../types'

export default {
  name: 'skip',
  aliases: ['sk'],
  description: 'Skips the current song.',
  guildOnly: true,
  execute: async message => {
    const queue = getQueue(message)
    if (!queue) return

    queue.connection.dispatcher.end()
    await message.channel.send(`Skipped \u2018${queue.songs[0].title}\u2019.`)
  }
} as Command<true>
