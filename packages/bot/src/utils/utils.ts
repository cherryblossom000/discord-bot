import path from 'node:path'
import {homedir} from 'node:os'
import originalCleanStack from 'clean-stack'
import {
  Channel as DiscordChannel,
  Constants,
  DiscordAPIError,
  Message as DiscordMessage
} from 'discord.js'
import {dev, me} from '../constants.js'
import type {
  EmbedFieldData,
  PermissionResolvable,
  PermissionString
} from 'discord.js'
import type Client from '../Client'
import type {
  Channel,
  GuildMessage,
  Message,
  Snowflake,
  TextBasedChannel,
  User
} from '../types'

declare global {
  namespace Intl {
    interface DateTimeFormatOptions {
      dateStyle?: 'full' | 'long' | 'medium' | 'short'
      timeStyle?: 'full' | 'long' | 'medium' | 'short'
    }
  }
}

const stackBasePath = path.join(
  homedir(),
  ...(dev
    ? ['dev', 'node', 'comrade-pingu', 'packages', 'bot']
    : ['comrade-pingu'])
)

/** Cleans up an error stack. */
const cleanStack = (stack: string): string =>
  originalCleanStack(stack, {basePath: stackBasePath})

/** Cleans up the error stack on an error. */
const cleanErrorsStack = <T extends Error>(error: T): T & {stack: string} => {
  error.stack = error.stack === undefined ? '' : cleanStack(error.stack)
  return error as T & {stack: string}
}

/** Creates a `catch` handler that ignores `DiscordAPIError`s. */
export const ignoreError =
  (key: keyof typeof Constants.APIErrors) =>
  (error: unknown): void => {
    if (
      !(
        error instanceof DiscordAPIError &&
        error.code === Constants.APIErrors[key]
      )
    )
      throw error
  }

/**
 * Replies to a message causing an error and either logs it or DMs me it depending on `NODE_ENV`.
 * @param info Extra information to send to the DM.
 * @param message The message to reply to, if applicable.
 * @param response The response in the message reply.
 */
// explicit type annotation needed for declaration (otherwise can't find name
// TextChannel etc)
export const handleError: (
  client: Client,
  error: unknown,
  info: string,
  messageOrChannel?: Message | TextBasedChannel,
  response?: string
) => void = (
  client,
  error,
  info,
  messageOrChannel,
  response = 'unfortunately, there was an error trying to execute that command. Noot noot.'
): void => {
  const errorHandler = (err: unknown): void => {
    if (err instanceof Error) cleanErrorsStack(err)
    console.error(
      'The error',
      err,
      'occurred when trying to handle the error',
      error
    )
  }
  // only error that will be thrown is if it's in development mode, which is
  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- intended
  ;(async (): Promise<void> => {
    if (error instanceof Error) cleanErrorsStack(error)
    if (messageOrChannel) {
      await (
        (messageOrChannel instanceof DiscordMessage
          ? messageOrChannel.reply(response)
          : messageOrChannel.send(response)) as Promise<Message>
      ).catch(errorHandler)
    }
    if (dev) throw error
    try {
      await (
        await client.users.fetch(me)!
      ).send(`${info}
**Error at ${new Date().toLocaleString()}**${
        error instanceof Error
          ? error.stack!
            ? `
      ${error.stack}`
            : ''
          : error
      }${
        error instanceof DiscordAPIError
          ? `
Code: ${error.code} (${
              Object.entries(Constants.APIErrors).find(
                ([, code]) => code === error.code
              )?.[0] ?? 'unknown'
            })
Path: ${error.path}
Method: ${error.method}
Status: ${error.httpStatus}`
          : ''
      }`)
    } catch (_error: unknown) {
      errorHandler(_error)
    }
  })()
}

/** Check if the bot has permissions. */
export const hasPermissions = (
  {channel, client}: GuildMessage,
  permissions: PermissionResolvable
): boolean => channel.permissionsFor(client.user!)?.has(permissions) ?? false

/** Check if the bot has permissions and sends a message if it doesn't. */
export const checkPermissions = async (
  message: GuildMessage,
  permissions: PermissionString | readonly PermissionString[]
): Promise<boolean> => {
  const {channel, client, guild} = message
  const channelPermissions = channel.permissionsFor(client.user!)
  if (channelPermissions?.has(permissions) !== true) {
    const neededPermissions = Array.isArray(permissions)
      ? permissions.filter(p => channelPermissions?.has(p) === true)
      : [permissions]

    const plural = neededPermissions.length !== 1
    const permissionsString = ` permission${plural ? 's' : ''}`

    await message.reply(
      [
        `I don’t have th${plural ? 'ese' : 'is'}${permissionsString}!`,
        neededPermissions.map(p => `- ${p}`).join('\n'),
        `To fix this, ask an admin or the owner of the server to add th${
          plural ? 'ose' : 'at'
        }${permissionsString} to ${guild.me!.roles.cache.find(
          role => role.managed
        )!}.`
      ].join('\n')
    )
    return false
  }
  return true
}

const idRegex = /^\d{17,19}$/u as unknown as Omit<RegExp, 'test'> & {
  test(string: string): string is Snowflake
}
const userTagRegex = /^.{2,}#\d{4}$/u
const messageLinkRegex =
  /https?:\/\/.*?discord(?:app)?\.com\/channels\/(\d+|@me)\/(\d+)\/(\d+)/u as Omit<
    RegExp,
    'exec'
  > & {
    exec(
      string: string
      // Using the RegExpExecArray means TS doesn't know spreading the type will result in 3 args
    ): [string, Snowflake | '@me', Snowflake, Snowflake] | null
  }
// Not using MessageMentions.CHANNELS_PATTERN because it's not anchored
const channelMentionRegex = /^<#(\d{17,19})>$/gu as Omit<RegExp, 'exec'> & {
  exec(string: string): [string, Snowflake] | null
}

const execOnce = <T extends readonly string[] | null>(
  regex: Omit<RegExp, 'exec'> & {exec(string: string): T},
  string: string
): T => {
  const result = regex.exec(string)
  regex.lastIndex = 0
  return result
}

/** Resolves a user based on user input. */
export const resolveUser = async (
  message: Message,
  input: string
): Promise<User | null> => {
  const {author, client, guild, mentions} = message

  // Check for mentioned user
  const mentionedUser = mentions.users.first()
  if (mentionedUser) return mentionedUser

  // Default to the message author
  if (!input) return author

  type KeysMatching<T, V> = {
    [K in keyof T]-?: T[K] extends V ? K : never
  }[keyof T]
  const getUser = async (
    key: KeysMatching<User, string>
  ): Promise<User | null> => {
    // Check if it's the bot or the author in a DM
    if (!guild && input !== author[key] && input !== client.user![key]) {
      await message.reply(
        'you can only get information about you or I in a DM!'
      )
      return null
    }

    // Find user
    const user = client.users.cache.find(u => u[key] === input)
    if (!user || !guild?.members.cache.get(user.id)) {
      await message.reply(
        `‘${input}’ is not a valid user or is not a member of this guild!`
      )
      return null
    }
    return user
  }

  if (userTagRegex.test(input)) return getUser('tag')
  if (idRegex.test(input)) return getUser('id')
  await message.reply(`‘${input}’ is not a valid user tag or ID!`)
  return null
}

const constNull = (): null => null

/** Resolves a message based on user input. */
// TODO: refactor
// eslint-disable-next-line max-statements -- can't be bothered lol
export const resolveMessage = async (
  message: Message,
  messageInput: string | undefined,
  channelInput: string | undefined
): Promise<Message | null> => {
  const {channel, client, flags, guild, reference} = message

  const resolve = async (
    guildID: Snowflake | '@me',
    channelOrID: Channel | Snowflake,
    messageID: Snowflake
  ): Promise<Message | null> => {
    const channelID =
      channelOrID instanceof DiscordChannel ? channelOrID.id : channelOrID
    if (
      (guild && guildID !== guild.id) ||
      (!guild && (guildID !== '@me' || channelID !== channel.id))
    ) {
      await message.reply(
        'that message is from another server or DM! Noot noot.'
      )
      return null
    }

    const resolvedChannel =
      channelOrID instanceof DiscordChannel
        ? channelOrID
        : await client.channels.fetch(channelOrID).catch(constNull)
    if (!resolvedChannel) {
      await message.reply(
        `channel with ID ${channelID} doesn’t exist or I don’t have permissions to view it!`
      )
      return null
    }
    if (
      resolvedChannel.type === 'GUILD_VOICE' ||
      resolvedChannel.type === 'GUILD_STORE'
    ) {
      await message.reply(
        `channel ${resolvedChannel.name} is a ${resolvedChannel.type} channel!`
      )
      return null
    }

    const resolvedMessage = await resolvedChannel.messages
      .fetch(messageID)
      .catch(constNull)
    if (!resolvedMessage) {
      await message.reply(
        `message with ID ${messageID} in ${
          resolvedChannel.type === 'DM'
            ? 'this channel'
            : // TODO: fix typescript-eslint thinking that resolvedChannel has no toString method
              (resolvedChannel as {toString: () => string})
        } doesn’t exist or I don’t have permissions to view it!`
      )
      return null
    }

    return resolvedMessage
  }

  // Check for referenced message (inline replies)
  const referencedMessage =
    // TODO [discord.js@>=13]: change to check if type == 19 (inline reply)
    reference?.messageId != null && !flags.has('IS_CROSSPOST')
      ? // All messages replied to must be in the same channel
        await channel.messages.fetch(reference.messageId).catch(constNull)
      : null
  if (referencedMessage) return referencedMessage

  if (messageInput === undefined) {
    await message.reply(
      'you must provide a message link or ID if you aren’t replying to a message!'
    )
    return null
  }

  let result: Message | null
  const messageLinkResult = execOnce(messageLinkRegex, messageInput)
  if (messageLinkResult) {
    const [, guildID, channelID, messageID] = messageLinkResult
    result = await resolve(guildID, channelID, messageID)
  } else if (idRegex.test(messageInput)) {
    let channelOrID: Channel | Snowflake
    if (channelInput === undefined) channelOrID = channel
    else {
      const channelMentionResult = execOnce(channelMentionRegex, channelInput)
      if (!channelMentionResult) {
        await message.reply(`${channelInput} is not a valid channel!`)
        return null
      }
      ;[, channelOrID] = channelMentionResult
    }
    result = await resolve(guild?.id ?? '@me', channelOrID, messageInput)
  } else {
    await message.reply(
      `‘${messageInput}${
        channelInput === undefined ? '' : ` ${channelInput}`
      }’ is not a valid message link or ID!`
    )
    return null
  }

  return result
}

export type DateFormatter = (date: Date) => string

export const createDateFormatter = (timeZone: string): DateFormatter => {
  const format = new Intl.DateTimeFormat('en-AU', {
    dateStyle: 'short',
    timeStyle: 'long',
    timeZone
  })
  return (date): string => {
    const parts = format.formatToParts(date)
    const part = (type: Intl.DateTimeFormatPartTypes): string | undefined =>
      parts.find(p => p.type === type)?.value
    return `${part('day')}/${part('month')}/${part('year')}, ${part(
      'hour'
    )}:${part('minute')} ${part('dayPeriod')!.toLowerCase()} ${
      part('timeZoneName') ?? 'GMT'
    }`
  }
}

export const formatBoolean = (boolean: boolean | null): string =>
  boolean ?? false ? 'Yes' : 'No'

export const imageField = (name: string, url: string): EmbedFieldData => ({
  name,
  value: `[Link](${url})`
})
