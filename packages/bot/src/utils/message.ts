import {emojis} from '../constants.js'
import {checkPermissions} from './utils.js'
import type {MessageOptions, MessagePayload} from 'discord.js'
import type {Message} from '../types'

export const sendDeletableMessage = async (
  message: Message,
  content: MessageOptions | MessagePayload | string,
  reply = false
): Promise<void> => {
  if (
    message.guild &&
    !(await checkPermissions(message, [
      'ADD_REACTIONS',
      'READ_MESSAGE_HISTORY'
    ]))
  )
    return
  const msg = await (reply
    ? message.reply(content)
    : message.channel.send(content))
  await msg.react(emojis.delete)
  await msg.awaitReactions({
    filter: ({emoji}, {id}) =>
      emoji.name === emojis.delete && id === message.author.id,
    max: 1
  })
  await msg.delete()
}
