import type * as D from 'discord.js'
import type {Db} from './database'
import type Client from './Client'

// #region Discord Extensions

export type Snowflake = `${bigint}`

export interface User extends D.User {
  id: Snowflake
}

interface MessageManager extends D.MessageManager {
  fetch(message: Snowflake, options?: D.BaseFetchOptions): Promise<Message>
  fetch(
    options?: D.ChannelLogsQueryOptions,
    cacheOptions?: D.BaseFetchOptions
  ): Promise<D.Collection<Snowflake, Message>>
}

interface TextChannel extends D.TextChannel {
  messages: MessageManager
  send(options: D.MessageOptions | D.MessagePayload | string): Promise<Message>
}

interface NewsChannel extends D.NewsChannel {
  messages: MessageManager
  send(options: D.MessageOptions | D.MessagePayload | string): Promise<Message>
}

interface DMChannel extends D.DMChannel {
  messages: MessageManager
  send(options: D.MessageOptions | D.MessagePayload | string): Promise<Message>
}

/** Any text-based guild channel. */
export type TextBasedGuildChannel = NewsChannel | TextChannel
export type TextBasedChannel = DMChannel | TextBasedGuildChannel

export type Channel = D.StoreChannel | D.VoiceChannel | TextBasedChannel

export interface GuildMember extends D.GuildMember {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define -- circular
  guild: Guild
}

interface GuildMemberManager extends D.GuildMemberManager {
  readonly cache: D.Collection<Snowflake, GuildMember>
}

/** A guild from this client. */
export interface Guild extends D.Guild {
  client: Client
  id: Snowflake
  members: GuildMemberManager
  systemChannel: TextChannel | null
}

interface MessageReference extends D.MessageReference {
  messageId: Snowflake | null
}

/** A message from this client. */

interface MessageMentions extends D.MessageMentions {
  readonly members: D.Collection<Snowflake, GuildMember>
  readonly users: D.Collection<Snowflake, User>
}

export interface BaseMessage extends D.Message {
  author: User
  client: Client
  guild: Guild | null
  mentions: MessageMentions
  reference: MessageReference | null
}

/** A message from a guild. */
export interface GuildMessage extends BaseMessage {
  channel: TextBasedGuildChannel
  guild: Guild
  member: GuildMember
}

/** A message from a DM. */
interface DMMessage extends BaseMessage {
  channel: DMChannel
  guild: null
  member: null
}

/** A message from this client. */
export type Message = DMMessage | GuildMessage

// #endregion

/** @template T The type of the message in `execute`. */
interface CommandBase<T extends Message> {
  /** The name. */
  name: string

  /**
   * Aliases.
   * @default []
   */
  aliases?: readonly string[]

  /** A description. */
  description: string

  /** Whether or not the command is only available in a server. */
  guildOnly?: boolean

  /** Whether or not the command is not shown in the help list of commands. */
  hidden?: boolean

  /**
   * The minimum number of arguments required.
   * @default 0
   */
  args?: number

  /** The syntax. */
  syntax?: string

  /** The explanation for how to use it. */
  usage?: string

  /**
   * The cooldown, in seconds.
   * @default 3
   */
  cooldown?: number

  /** The actual command. */
  execute(
    message: T,
    input: {args: readonly string[]; input: string},
    database: Db
  ): Promise<void> | void
}

export interface GuildOnlyCommand extends CommandBase<GuildMessage> {
  guildOnly: true
}

export interface AnyCommand extends CommandBase<DMMessage | GuildMessage> {
  guildOnly?: false
}

/** A command. */
export type Command = AnyCommand | GuildOnlyCommand

/** A command that is triggered based on a regular expression. */
export interface RegexCommand {
  /** The regex to test for. */
  regex: RegExp

  /** The message to reply with. Can be a function that returns the message.. */
  regexMessage: string | ((message: Message) => string)
}
