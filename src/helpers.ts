import {join} from 'path'
import upperFirst from 'lodash.upperfirst'
import {me} from './constants'
import type {Message, Client} from 'discord.js'

/** Creates a function to easily resolve paths relative to the `__dirname`. */
export const createResolve = (__dirname: string) => (p: string): string => join(__dirname, p)

/**
 * Replies to a message.
 * @param message The message to reply to.
 * @param content The content of the message.
 */
export const reply = async (message: Message, content: string): Promise<Message> =>
  message.reply(message.guild ? content : upperFirst(content))

/**
 * DMs me an error.
 * @param info Extra information to send.
 */
export const sendMeError = async (client: Client, error: Error, info: string): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    (await client.users.fetch(me)!).send(`${info}
**Error at ${new Date().toLocaleString()}**
${error.stack}`)
  }
}

/**
 * Replies to a message causing an error and either logs it or DMs me it depending on `NODE_ENV`.
 * @param info Extra information to send to the DM.
 * @param response The response in the message reply.
 */
export const handleError = (
  client: Client,
  error: Error,
  message: Message,
  info: string,
  response = 'unfortunately, there was an error trying to execute that command. Noot noot.'
): void => {
  reply(message, response)
  if (process.env.NODE_ENV === 'production') sendMeError(client, error, info)
  else throw error
}
