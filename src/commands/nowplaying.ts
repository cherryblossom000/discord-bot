import {getQueue} from '../helpers'
import type {Command} from '../types'

export default {
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
} as Command<true>
