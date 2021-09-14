import {getQueue} from '../utils.js'
import type {GuildOnlyCommand} from '../types'

const command: GuildOnlyCommand = {
  name: 'skip',
  aliases: ['sk'],
  description: 'Skips the current song.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message, true)
    if (!queue) return

    queue.connection.dispatcher.end()
    await message.channel.send(`Skipped **${queue.songs[0].title}**.`)
  }
}
export default command
