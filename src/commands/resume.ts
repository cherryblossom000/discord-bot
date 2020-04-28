import {emojis} from '../constants'
import {getQueue, hasPermissions} from '../helpers'
import type {StreamDispatcher} from 'discord.js'
import type {Command, GuildMessage} from '../types'

export const resume = async (dispatcher: StreamDispatcher, message: GuildMessage): Promise<void> => {
  dispatcher.resume()
  if (hasPermissions(message, 'READ_MESSAGE_HISTORY')) await message.react(emojis.resume)
  else {
    await message.channel.send(`Resumed the music.
I can react on your message instead if you enable the READ_MESSAGE_HISTORY permission.`)
  }
}

const _: Command<true> = {
  name: 'resume',
  aliases: ['r', 'unpause'],
  description: 'Resumes the song currently playing.',
  guildOnly: true,
  async execute(message) {
    const queue = await getQueue(message)
    if (!queue) return
    resume(queue.connection.dispatcher, message)
  }
}
export default _
