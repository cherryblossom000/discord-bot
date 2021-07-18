import {emojis} from '../constants'
import {getQueue, hasPermissions} from '../utils'
import type {StreamDispatcher} from 'discord.js'
import type {GuildOnlyCommand, GuildMessage} from '../types'

export const resume = async (
  dispatcher: StreamDispatcher,
  message: GuildMessage
): Promise<void> => {
  dispatcher.resume()
  await (hasPermissions(message, 'READ_MESSAGE_HISTORY')
    ? message.react(emojis.resume)
    : message.channel.send(`Resumed the music.
I can react on your message instead if you enable the READ_MESSAGE_HISTORY permission.`))
}

const command: GuildOnlyCommand = {
  name: 'resume',
  aliases: ['r', 'unpause'],
  description: 'Resumes the song currently playing.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return
    await resume(queue.connection.dispatcher, message)
  }
}
export default command
