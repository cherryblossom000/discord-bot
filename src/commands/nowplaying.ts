import {getQueue} from '../helpers'
import type {Command} from '../types'

const command: Command<true> = {
  name: 'nowplaying',
  aliases: ['np'],
  description: 'Gets the song currently playing.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return

    const [{title, author, id}] = queue.songs
    await message.channel.send(`Now playing **${title}** by ${author} (${id}).`)
  }
}
export default command
