import {getQueue} from '../utils'
import type {GuildOnlyCommand} from '../types'

const command: GuildOnlyCommand = {
  name: 'queue',
  aliases: ['q'],
  description: 'Views the music queue.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return

    await message.channel.send(
      queue.songs.map(
        (song, i) =>
          `${i + 1}: **${song.title}** by ${song.author} (${song.id})`
      ),
      {split: true}
    )
  }
}
export default command
