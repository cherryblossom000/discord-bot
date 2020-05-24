import {join} from 'path'
import {MessageEmbed} from 'discord.js'
import yts from 'yt-search'
import {defaultPrefix, emojis, me} from './constants'
import type Keyv from 'keyv'
import type {PermissionResolvable, PermissionString} from 'discord.js'
import type {VideoSearchResult} from 'yt-search'
import type {Client, DatabaseGuild, Guild, GuildMessage, Message, Queue, Video} from './types'

/** Creates a function to easily resolve paths relative to the `__dirname`. */
export const createResolve = (dirname: string) => (p: string): string => join(dirname, p)

/**
 * DMs me an error.
 * @param info Extra information to send.
 */
export const sendMeError = async (client: Client, error: Error, info: string): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    // TODO: provide more information if it's a DiscordAPIError (e.g. path)
    (await client.users.fetch(me)!).send(`${info}
**Error at ${new Date().toLocaleString()}**${error.stack === undefined ? '' : `
${error.stack}`}`)
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
  if (message) message.reply(response)
  if (process.env.NODE_ENV === 'production') sendMeError(client, error, info)
  else throw error
}

/** Check if the bot has permissions. */
export const hasPermissions = ({channel, client}: GuildMessage, permissions: PermissionResolvable): boolean =>
  channel.permissionsFor(client.user!)?.has(permissions) ?? false

/** Check if the bot has permissions and sends a message if it doesn't. */
export const checkPermissions = (
  message: GuildMessage,
  permissions: PermissionString | PermissionString[]
): boolean => {
  const {channel, client, guild} = message,
    channelPermissions = channel.permissionsFor(client.user!)
  if (!channelPermissions?.has(permissions)) {
    const neededPermissions = Array.isArray(permissions)
      ? permissions.filter(p => !channelPermissions?.has(p))
      : [permissions]

    const plural = neededPermissions.length !== 1,
      permissionsString = ` permission${plural ? 's' : ''}`

    message.reply([
      `I don\u2019t have th${plural ? 'ese' : 'is'}${permissionsString}!`,
      neededPermissions.map(p => `* ${p}`).join('\n'),
      `To fix this, ask an admin or the owner of the server to add th${plural ? 'ose' : 'at'}${permissionsString} to ${
        guild.member(client.user!)!.roles.cache.find(role => role.managed)!
      }.`
    ])
    return false
  }
  return true
}

/** Gets the queue and sends a message no music is playing. */
export const getQueue = async ({channel, client: {queues}, guild}: GuildMessage): Promise<Queue | void> => {
  const queue = queues.get(guild.id)
  if (queue) return queue
  await channel.send('No music is playing!')
}

/** Sets a value for a guild in a database. */
export const set = async <T extends keyof DatabaseGuild>(
  database: Keyv<DatabaseGuild>,
  guild: Guild,
  key: T,
  value: DatabaseGuild[T]
): Promise<true> => database.set(guild.id, {...await database.get(guild.id), [key]: value})

/** Gets the prefix for a guild. */
export const getPrefix = async (database: Keyv<DatabaseGuild>, guild: Guild | null): Promise<string> =>
  guild ? (await database.get(guild.id))?.prefix ?? defaultPrefix : defaultPrefix

/** Converts a `yts.VideoSearchResult` into a `Video`. */
export const searchToVideo = ({title, videoId: id, author: {name}}: VideoSearchResult): Video =>
  ({title, id, author: name})

/** Searches YouTube for a video. */
export const searchYoutube = async (
  message: Message,
  query: string
): Promise<VideoSearchResult | void> => {
  if (message.guild && !checkPermissions(message, [
    'MANAGE_MESSAGES', 'EMBED_LINKS', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS'
  ])) return
  const {author, channel} = message

  const {videos} = await yts(query)
  if (!videos.length) {
    await channel.send(`No results were found for ${query}. Try using a YouTube link instead.`)
    return
  }

  let current: VideoSearchResult[]

  /**
   * Generates the embed with videos and message content.
   * @param start The index to start from.
   */
  const generateEmbed = (start: number): [string, MessageEmbed] => {
    current = videos.slice(start, start + 10)

    const embed = new MessageEmbed()
      .setTitle(`Showing songs ${start + 1}-${start + current.length} out of ${videos.length}`)
      .setDescription(`Click on the title for the YouTube link.
  If you can\u2019t be bothered to wait for the reactions you can just add the reaction yourself.`)
    current.forEach((v, i) => embed.addField(`${i + start + 1}. ${v.author.name}
  ${emojis.numbers[i + 1]}`, `[${v.title}](${v.url})`, true))
    return ['**Which song would you like to play?**', embed]
  }

  const embedMessage = await channel.send(...generateEmbed(0))

  const reactNumbers = async (): Promise<void> => {
    // eslint-disable-next-line no-await-in-loop
    for (let i = 1; i <= current.length; i++) await embedMessage.react(emojis.numbers[i])
  }

  if (videos.length <= 10) return
  await embedMessage.react(emojis.right)
  reactNumbers()

  let currentIndex = 0

  const collector = embedMessage.createReactionCollector(
    ({emoji: {name}}, {id}) => [emojis.left, emojis.right, ...emojis.numbers].includes(name) && id === author.id,
    // eslint-disable-next-line no-loss-of-precision
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
        return resolve(current[n - 1])
      }

      // If the reaction is an arrow change the page
      await embedMessage.reactions.removeAll()
      currentIndex += name === emojis.left ? -10 : 10
      embedMessage.edit(...generateEmbed(currentIndex))
      if (currentIndex !== 0) await embedMessage.react(emojis.left)
      if (currentIndex + 10 < videos.length) await embedMessage.react(emojis.right)
      reactNumbers()
    })
  })
}
