import {join} from 'path'
import upperFirst from 'lodash.upperfirst'
import {me} from './constants'
import type {PermissionString} from 'discord.js'
import type {Client, Message, GuildMessage} from './types'

/** Creates a function to easily resolve paths relative to the `__dirname`. */
export const createResolve = (__dirname: string) => (p: string): string => join(__dirname, p)

/**
 * Replies to a message.
 * @param message The message to reply to.
 * @param content The content of the message.
 */
export const reply = async (message: Message, content: string | string[]): Promise<Message> =>
  message.reply(message.guild
    ? content
    : Array.isArray(content) ? (content[0] = upperFirst(content[0]), content) : upperFirst(content)
  )

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
 * @param message The message to reply to, if applicable.
 * @param response The response in the message reply.
 */
export const handleError = (
  client: Client,
  error: Error,
  info: string,
  message?: Message,
  response = 'unfortunately, there was an error trying to execute that command. Noot noot.'
): void => {
  if (message) reply(message, response)
  if (process.env.NODE_ENV === 'production') sendMeError(client, error, info)
  else throw error
}

/** Check if the bot has permissions. */
export const checkPermissions = (
  message: GuildMessage,
  permissions: PermissionString | PermissionString[]
): boolean => {
  const {channel, client, guild} = message
  const channelPermissions = channel.permissionsFor(client.user!)
  if (!channelPermissions?.has(permissions)) {
    const neededPermissions = Array.isArray(permissions)
      ? permissions.filter(p => !channelPermissions?.has(p))
      : [permissions]

    const plural = neededPermissions.length !== 1
    const permissionsString = ` permission${plural ? 's' : ''}`

    reply(message, [
      `I don\u2019t have th${plural ? 'ese' : 'is'}${permissionsString}!`,
      neededPermissions.map(p => `* ${p}`).join('\n'),
      `To fix this, ask an admin or the owner of the server to add th${plural ? 'ose' : 'at'}${permissionsString} to ${
        guild.member(client.user!)!.roles.cache.find(role => role.managed)
      }.`
    ])
    return false
  }
  return true
}
