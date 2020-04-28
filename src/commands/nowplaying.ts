import {getQueue} from '../helpers'
import type {Command} from '../types'

const _: Command<true> = {
  name: 'nowplaying',
  aliases: ['np'],
  description: 'Gets the song currently playing.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return

    const [{title, author, id}] = queue.songs
    await message.channel.send(`Now playing \u2018${title}\u2019 by ${author} (${id}).`)
  }
}
export default _
