import path from 'node:path'
import {homedir} from 'node:os'
import {bold, codeBlock, hyperlink, inlineCode} from '@discordjs/builders'
import D, {
  Constants,
  DiscordAPIError,
  MessageButton,
  type BaseCommandInteraction,
  type Collection,
  type EmbedFieldData,
  type Guild,
  type GuildTextBasedChannel,
  type InteractionReplyOptions,
  type Message,
  type MessageButtonOptions,
  type PermissionString,
  type Snowflake,
  type TextBasedChannel,
  type WebhookEditMessageOptions
} from 'discord.js'
import originalCleanStack from 'clean-stack'
import * as undici from 'undici'
import {dev, emojis, me} from '../constants.js'
import type {APIMessage} from 'discord-api-types/v9'
import type {Client} from '../Client'
import type {
  CommandInteraction,
  GuildCommandInteraction,
  GuildSlashCommandInteraction,
  InGuildCacheType
} from '../types'

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never
}[keyof T]

export type RequireKeys<T, K extends keyof T> = Required<Pick<T, K>> & T

export type Override<T, U> = Omit<T, keyof U> & U

export type UnionToIntersection<T> = (
  T extends unknown ? (arg: T) => void : never
) extends (arg: infer U) => void
  ? U
  : never

export type CollectionValue<T extends Collection<unknown, unknown>> =
  T extends Collection<unknown, infer V> ? V : never

export const inObject = <T extends object, K extends PropertyKey>(
  object: T,
  key: K
): key is K & keyof T => key in object

class RequestError extends Error {
  override readonly name = 'RequestError'
  constructor(
    readonly statusCode: number,
    message: string,
    readonly url: string,
    readonly body: string
  ) {
    super(
      `${message} (url: ${url}) failed with status code ${statusCode}
Body: ${body}`
    )
  }
}

export const request = async (
  message: string,
  url: URL | string
): Promise<undici.Dispatcher.ResponseData['body']> => {
  const {statusCode, body} = await undici.request(url)
  if (statusCode !== 200) {
    throw new RequestError(
      statusCode,
      message,
      url.toString(),
      await body
        .text()
        .then(codeBlock)
        .catch(error => `${inlineCode('body.text()')} failed: ${error}`)
    )
  }
  return body
}

// #region Errors

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

// #endregion

// #region Fetching/Discord API

export const fetchChannel = async <T extends CommandInteraction>(
  interaction: T
): Promise<
  T extends GuildCommandInteraction ? GuildTextBasedChannel : TextBasedChannel
> => {
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
}: BaseCommandInteraction<InGuildCacheType>): Promise<Guild> =>
  client.guilds.fetch(guildId)

export const enum ReplyMode {
  REPLY,
  EDIT_REPLY,
  FOLLOW_UP
}

export const replyAndFetch: {
  (
    interaction: CommandInteraction,
    options: Omit<InteractionReplyOptions, 'fetchReply'>
  ): Promise<Message>
  <T extends ReplyMode>(
    interaction: CommandInteraction,
    options: Omit<
      UnionToIntersection<
        T extends ReplyMode.EDIT_REPLY
          ? WebhookEditMessageOptions
          : InteractionReplyOptions
      >,
      'fetchReply'
    >,
    mode: T
  ): Promise<Message>
} = async (
  interaction: CommandInteraction,
  options: Omit<
    InteractionReplyOptions | WebhookEditMessageOptions,
    'fetchReply'
  >,
  mode = ReplyMode.REPLY
): Promise<Message> => {
  // TODO: investigate strange TS thing where it only sometimes thinks message
  // can be void without this annotation
  const message = (await interaction[
    mode === ReplyMode.REPLY
      ? 'reply'
      : mode === ReplyMode.EDIT_REPLY
      ? 'editReply'
      : 'followUp'
  ]({...options, fetchReply: true})) as APIMessage | D.Message
  return message instanceof D.Message
    ? message
    : (
        (await interaction.client.channels.fetch(
          interaction.channelId
        ))! as TextBasedChannel
      ).messages.fetch(message.id)
}

export const deleteMessage = async (
  client: Client,
  channelId: Snowflake,
  messageId: Snowflake
): Promise<void> => {
  await (
    client['api'] as {
      channels: (id: Snowflake) => {
        messages: (id: Snowflake) => {delete: () => Promise<unknown>}
      }
    }
  )
    .channels(channelId)
    .messages(messageId)
    .delete()
}

// #endregion

/** Check if the bot has permissions and sends a message if it doesn't. */
export const checkPermissions = async (
  interaction: CommandInteraction,
  permissions: PermissionString | readonly PermissionString[]
): Promise<boolean> => {
  if (!interaction.inGuild()) return true
  const {client, guildId} = interaction
  const channel = await fetchChannel(interaction)

  const channelPermissions = channel.permissionsFor(client.user!)
  if (channelPermissions?.has(permissions) !== true) {
    const neededPermissions = Array.isArray(permissions)
      ? permissions.filter(p => channelPermissions?.has(p) === true)
      : [permissions]

    const plural = neededPermissions.length !== 1
    const permissionsString = ` permission${plural ? 's' : ''}`

    await interaction.reply({
      content: `I don’t have th${plural ? 'ese' : 'is'}${permissionsString}!
${neededPermissions.map(p => `- ${p}`).join('\n')}
To fix this, ask an admin or the owner of the server to add th${
        plural ? 'ose' : 'at'
      }${permissionsString} to ${(
        await client.guilds.fetch(guildId)
      ).me!.roles.cache.find(role => role.managed)!}.`,
      ephemeral: true
    })
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

export const BACK = 'back'
export const FORWARD = 'forward'

const backButtonOptions: MessageButtonOptions = {
  style: 'SECONDARY',
  label: 'Back',
  emoji: emojis.left,
  customId: BACK
}
const forwardButtonOptions: MessageButtonOptions = {
  style: 'SECONDARY',
  label: 'Forward',
  emoji: emojis.right,
  customId: FORWARD
}

export const backButton = new MessageButton(backButtonOptions)
export const forwardButton = new MessageButton(forwardButtonOptions)
export const backButtonDisabled = new MessageButton({
  ...backButtonOptions,
  disabled: true
})
export const forwardButtonDisabled = new MessageButton({
  ...forwardButtonOptions,
  disabled: true
})

export const timeoutFollowUp = async (
  interaction: CommandInteraction
): Promise<void> => {
  await interaction.followUp({
    content: 'You took too long to answer.',
    ephemeral: true
  })
}
