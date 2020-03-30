import {getQueue} from '../helpers'
import type {Command} from '../types'

const command: Command<true> = {
  name: 'nowplaying',
  aliases: ['np'],
  description: 'Gets the song currently playing.',
  guildOnly: true,
  execute: message => {
    const queue = getQueue(message)
    if (!queue) return

    const [{title, author, id}] = queue.songs
    message.channel.send(`Now playing \u2018${title}\u2019 by ${author} (${id}).`)
  }
}
export default command