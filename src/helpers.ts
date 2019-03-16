import upperFirst from 'lodash.upperfirst'
import type {Message} from 'discord.js'

/** Logs the current date. */
export const logDate = (): void => {
  console.log(new Date().toLocaleString())
}

/**
 * Replies to a message.
 * @param message The message to reply to.
 * @param content The content of the message.
 */
export const reply = (message: Message, content: string): void => {
  message.reply(message.guild ? content : upperFirst(content))
}
