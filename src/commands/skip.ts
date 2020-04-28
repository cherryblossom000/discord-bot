import {getQueue} from '../helpers'
import type {Command} from '../types'

const _: Command<true> = {
  name: 'skip',
  aliases: ['sk'],
  description: 'Skips the current song.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return

    queue.connection.dispatcher.end()
    await message.channel.send(`Skipped \u2018${queue.songs[0].title}\u2019.`)
  }
}
export default _
