import {getQueue} from '../helpers'
import type {Command} from '../types'

export default {
  name: 'queue',
  aliases: ['q'],
  description: 'Views the music queue.',
  guildOnly: true,
  execute: async message => {
    const queue = getQueue(message)
    if (!queue) return

    await message.channel.send(
      queue.songs.map((song, i) => `${i + 1}: \u2018${song.title}\u2019 by ${song.author} (${song.id})`),
      {split: true}
    )
  }
} as Command<true>
