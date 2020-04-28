import {getQueue} from '../helpers'
import type {Command} from '../types'

const _: Command<true> = {
  name: 'queue',
  aliases: ['q'],
  description: 'Views the music queue.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return

    await message.channel.send(
      queue.songs.map((song, i) => `${i + 1}: \u2018${song.title}\u2019 by ${song.author} (${song.id})`),
      {split: true}
    )
  }
}
export default _
