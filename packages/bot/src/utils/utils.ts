import path from 'node:path'
import {homedir} from 'node:os'
import {bold, codeBlock, hyperlink} from '@discordjs/builders'
import originalCleanStack from 'clean-stack'
import D, {Constants, DiscordAPIError, Message} from 'discord.js'
import {dev, me} from '../constants.js'
import type {
  BaseCommandInteraction,
  EmbedFieldData,
  Guild,
  GuildTextBasedChannel,
  InteractionReplyOptions,
  MessageContextMenuInteraction,
  PermissionString,
  TextBasedChannel
} from 'discord.js'
import type {Client} from '../Client'
import type {CommandInteraction, GuildSlashCommandInteraction} from '../types'

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
 * @param content The response in the message reply.
 */
// explicit type annotation needed for declaration (otherwise can't find name
// TextChannel etc)
export const handleError: (
  client: Client,
  error: unknown,
  info?: string,
  respondOpts?: {
    to?: CommandInteraction | TextBasedChannel
    response?: string
    followUp?: boolean
  }
) => void = (
  client,
  error,
  info,
  {
    to: channelOrInteraction,
    response:
      content = 'Unfortunately, there was an error trying to execute that command. Noot noot.',
    followUp = false
  } = {}
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
    if (channelOrInteraction) {
      await (channelOrInteraction instanceof D.Interaction
        ? followUp
          ? channelOrInteraction.followUp({content, ephemeral: true})
          : channelOrInteraction.reply({content, ephemeral: true})
        : channelOrInteraction.send(content)
      ).catch(errorHandler)
    }
    if (dev) throw error
    try {
      await (
        await client.users.fetch(me)!
      ).send(
        `${info === undefined ? '' : `${info}\n`}${bold(
          `Error at ${new Date().toLocaleString()}`
        )}${
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
Status: ${error.httpStatus}
Request data:
${codeBlock('json', JSON.stringify(error.requestData, null, 2))}`
            : ''
        }`
      )
    } catch (error_) {
      errorHandler(error_)
    }
  })()
}

export const debugInteractionDetails = ({
  id,
  channelId,
  options
}: CommandInteraction): string => `Id: ${id}
Channel: ${channelId}
Options: ${codeBlock('json', JSON.stringify(options.data, null, 2))}`

export const fetchChannel = async (
  interaction: CommandInteraction
): Promise<TextBasedChannel> => {
  const {channelId, client} = interaction
  const channel = (await client.channels.fetch(
    channelId
  )) as GuildTextBasedChannel | null
  if (!channel) {
    throw new Error(
      `fetchChannel: Channel ${channelId} could not be fetched from interaction
${debugInteractionDetails(interaction)}`
    )
  }
  return channel
}

export const fetchGuild = async ({
  client,
  guildId
}: BaseCommandInteraction<'present'>): Promise<Guild> =>
  client.guilds.fetch(guildId)

export const fetchMessage = async ({
  client,
  options
}: MessageContextMenuInteraction): Promise<Message> => {
  const message = options.getMessage('message', true)
  return message instanceof Message
    ? message
    : (
        (await client.channels.fetch(message.channel_id)) as TextBasedChannel
      ).messages.fetch(message.id)
}

export const replyAndFetch = async (
  interaction: CommandInteraction,
  options: Omit<InteractionReplyOptions, 'fetchReply'>,
  followUp = false
): Promise<Message> => {
  const opts: InteractionReplyOptions & {fetchReply: true} = {
    ...options,
    fetchReply: true
  }
  const message = await (followUp
    ? interaction.followUp(opts)
    : interaction.reply(opts))
  return message instanceof D.Message
    ? message
    : (
        (await interaction.client.channels.fetch(
          interaction.channelId
        ))! as TextBasedChannel
      ).messages.fetch(message.id)
}

/** Check if the bot has permissions and sends a message if it doesn't. */
export const checkPermissions = async (
  interaction: CommandInteraction,
  permissions: PermissionString | readonly PermissionString[]
): Promise<boolean> => {
  if (!interaction.inGuild()) return true
  const {client, guildId} = interaction
  const channel = (await fetchChannel(interaction)) as GuildTextBasedChannel

  const channelPermissions = channel.permissionsFor(client.user!)
  if (channelPermissions?.has(permissions) !== true) {
    const neededPermissions = Array.isArray(permissions)
      ? permissions.filter(p => channelPermissions?.has(p) === true)
      : [permissions]

    const plural = neededPermissions.length !== 1
    const permissionsString = ` permission${plural ? 's' : ''}`

    await interaction.reply(
      `I don’t have th${plural ? 'ese' : 'is'}${permissionsString}!
${neededPermissions.map(p => `- ${p}`).join('\n')}
To fix this, ask an admin or the owner of the server to add th${
        plural ? 'ose' : 'at'
      }${permissionsString} to ${(
        await client.guilds.fetch(guildId)
      ).me!.roles.cache.find(role => role.managed)!}.`
    )
    return false
  }
  return true
}

export const checkIfAdmin = async (
  interaction: GuildSlashCommandInteraction,
  guild: Guild
): Promise<boolean> => {
  if (
    !(await guild.members.fetch(interaction.user.id)).permissions.has(
      'ADMINISTRATOR'
    )
  ) {
    await interaction.reply({
      content: 'This command can only be used by an administrator!',
      ephemeral: true
    })
    return false
  }
  return true
}

export const imageField = (name: string, url: string): EmbedFieldData => ({
  name,
  value: hyperlink('Link', url)
})
