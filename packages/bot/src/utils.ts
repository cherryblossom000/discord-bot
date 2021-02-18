import path from 'path'
import {homedir} from 'os'
import _cleanStack from 'clean-stack'
import {
  Constants,
  DiscordAPIError,
  Message as DiscordMessage,
  MessageEmbed
} from 'discord.js'
import yts from 'yt-search'
import {dev, emojis, me} from './constants'
import type {
  EmbedFieldData,
  MessageReaction,
  PermissionResolvable,
  PermissionString,
  User
} from 'discord.js'
import type {VideoSearchResult} from 'yt-search'
import type Client from './Client'
import type {
  GuildMessage,
  Message,
  Queue,
  TextBasedChannel,
  Video
} from './types'

/** Creates a function to easily resolve paths relative to the `__dirname`. */
export const createResolve = (dirname: string) => (
  ...paths: readonly string[]
): string => path.join(dirname, ...paths)

const stackBasePath = path.join(
  homedir(),
  ...(dev
    ? ['dev', 'node', 'comrade-pingu', 'packages', 'bot']
    : ['comrade-pingu'])
)

/** Cleans up an error stack. */
const cleanStack = (stack: string): string =>
  _cleanStack(stack, {basePath: stackBasePath})

/** Cleans up the error stack on an error. */
export const cleanErrorsStack = <T extends Error>(
  error: T
): T & {stack: string} => {
  error.stack = error.stack === undefined ? '' : cleanStack(error.stack)
  return error as T & {stack: string}
}

/** Creates a `catch` handler that ignores `DiscordAPIError`s. */
export const ignoreError = (key: keyof typeof Constants.APIErrors) => (
  error: unknown
): void => {
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
  const errorHandler = (_error: unknown): void => {
    if (_error instanceof Error) cleanErrorsStack(_error)
    console.error(
      'The error',
      _error,
      'occurred when trying to handle the error',
      error
    )
  }
  // only error that will be thrown is if it's in development mode, which is
  // eslint-disable-next-line @typescript-eslint/no-floating-promises -- intended
  ;(async (): Promise<void> => {
    if (error instanceof Error) cleanErrorsStack(error)
    if (messageOrChannel) {
      await ((messageOrChannel instanceof DiscordMessage
        ? messageOrChannel.reply(response)
        : messageOrChannel.send(response)) as Promise<Message>).catch(
        errorHandler
      )
    }
    if (dev) throw error
    try {
      await (await client.users.fetch(me)!).send(`${info}
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

    await message.reply([
      `I don’t have th${plural ? 'ese' : 'is'}${permissionsString}!`,
      neededPermissions.map(p => `- ${p}`).join('\n'),
      `To fix this, ask an admin or the owner of the server to add th${
        plural ? 'ose' : 'at'
      }${permissionsString} to ${guild.me!.roles.cache.find(
        role => role.managed
      )!}.`
    ])
    return false
  }
  return true
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
    if (!user || !guild!.member(user)) {
      await message.reply(
        `‘${input}’ is not a valid user or is not a member of this guild!`
      )
      return null
    }
    return user
  }

  if (/^.{2,}#\d{4}$/u.test(input)) return getUser('tag')
  if (/^\d{17,19}$/u.test(input)) return getUser('id')
  await message.reply(`‘${input}’ is not a valid user tag or ID!`)
  return null
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
  boolean === true ? 'Yes' : 'No'

export const imageField = (name: string, url: string): EmbedFieldData => ({
  name,
  value: `[Link](${url})`
})

type NonEmptyArray<T> = [T, ...T[]]

/** Gets the queue and sends a message no music is playing. */
export const getQueue = (async (
  {channel, client: {queues}, guild}: GuildMessage,
  errorOnEmpty = false
): Promise<Queue | void> => {
  const queue = queues.get(guild.id)
  if (errorOnEmpty ? !!(queue?.songs.length ?? 0) : !!queue) return queue
  await channel.send('No music is playing!')
}) as {
  (
    {
      channel,
      client: {queues},
      guild
    }: GuildMessage,
    errorOnEmpty: true
  ): Promise<(Queue & {songs: NonEmptyArray<Video>}) | undefined>
  (
    {
      channel,
      client: {queues},
      guild
    }: GuildMessage,
    errorOnEmpty?: false
  ): Promise<Queue | undefined>
}

/** Converts a `yts.VideoSearchResult` into a `Video`. */
export const searchToVideo = ({
  title,
  videoId: id,
  author: {name}
}: VideoSearchResult): Video => ({title, id, author: name})

/** Searches YouTube for a video. */
export const searchYoutube = async (
  message: Message,
  query: string
): Promise<VideoSearchResult | void> => {
  if (
    message.guild &&
    !(await checkPermissions(message, [
      'EMBED_LINKS',
      'READ_MESSAGE_HISTORY',
      'ADD_REACTIONS'
    ]))
  )
    return
  const {author, channel} = message

  const {videos} = await yts(query)
  if (!videos.length) {
    await channel.send(
      `No results were found for ${query}. Try using a YouTube link instead.`
    )
    return
  }

  let current: readonly VideoSearchResult[]

  /**
   * Generates the embed with videos and message content.
   * @param skip The index to start from.
   */
  const generateEmbed = (skip: number): readonly [string, MessageEmbed] => {
    current = videos.slice(skip, skip + 10)

    const embed = new MessageEmbed().setTitle(
      `Showing songs ${skip + 1}-${skip + current.length} out of ${
        videos.length
      }`
    ).setDescription(`Click on the title for the YouTube link.
  If you can’t be bothered to wait for the reactions you can just add the reaction yourself.`)
    current.forEach((v, i) =>
      embed.addField(
        `${i + skip + 1}. ${v.author.name}
  ${emojis.numbers[i + 1]}`,
        `[${v.title}](${v.url})`,
        true
      )
    )
    return ['**Which song would you like to play?**', embed]
  }

  const embedMessage = await channel.send(...generateEmbed(0))

  const reactNumbers = async (): Promise<void> => {
    for (let i = 1; i <= current.length; i++)
      // eslint-disable-next-line no-await-in-loop -- loop is necessary for the numbers to be in order
      await embedMessage.react(emojis.numbers[i]!)
  }

  if (videos.length <= 10) return
  await embedMessage.react(emojis.right)
  await reactNumbers()

  let currentIndex = 0

  const collector = embedMessage.createReactionCollector(
    ({emoji: {name}}: MessageReaction, {id}: User) =>
      [emojis.left, emojis.right, ...emojis.numbers].includes(name) &&
      id === author.id,
    {idle: 60_000}
  )

  return new Promise(resolve => {
    collector.on('collect', async ({emoji: {name}}) => {
      const n = emojis.numbers.indexOf(name)
      // If the emoji is greater than the number of videos shown exit
      if (n > current.length) return

      // If the reaction is a number return the video
      if (n > -1) {
        collector.stop()
        resolve(current[n - 1])
        return
      }

      let shouldReact = true
      // If the reaction is an arrow change the page
      await embedMessage.reactions.removeAll().catch(error => {
        ignoreError('MISSING_PERMISSIONS')(error)
        shouldReact = false
      })
      currentIndex += name === emojis.left ? -10 : 10
      await embedMessage.edit(...generateEmbed(currentIndex))
      if (shouldReact as boolean) {
        if (currentIndex) await embedMessage.react(emojis.left)
        if (currentIndex + 10 < videos.length)
          await embedMessage.react(emojis.right)
        await reactNumbers()
      }
    })
  })
}
