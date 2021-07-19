import type * as D from 'discord.js'
import type {Db} from './database'
import type Client from './Client'

// #region Discord Extensions

export type Snowflake = `${bigint}`

// Custom Message

interface MessageManager extends D.MessageManager {
  fetch(
    message: D.Snowflake,
    cache?: boolean,
    force?: boolean
  ): Promise<Message>
  fetch(
    options?: D.ChannelLogsQueryOptions,
    cache?: boolean,
    force?: boolean
  ): Promise<D.Collection<D.Snowflake, Message>>
}

export type OptionsNoSplit = D.MessageOptions & {split?: false}
export type OptionsWithSplit = D.MessageOptions & {split: D.SplitOptions | true}

export type SendArgs =
  | [
      | D.APIMessage
      | D.APIMessageContentResolvable
      | D.MessageAdditions
      | D.MessageOptions
    ]
  | [D.APIMessageContentResolvable, (D.MessageAdditions | D.MessageOptions)?]
  | [D.StringResolvable, D.MessageAdditions | D.MessageOptions]

interface TextChannel extends D.TextChannel {
  messages: MessageManager
  send(content: OptionsWithSplit): Promise<GuildMessage[]>
  send(
    options: D.APIMessageContentResolvable | D.MessageAdditions | OptionsNoSplit
  ): Promise<GuildMessage>
  send(
    content: D.StringResolvable,
    options: OptionsWithSplit
  ): Promise<GuildMessage[]>
  send(
    content: D.StringResolvable,
    options: D.MessageAdditions | OptionsNoSplit
  ): Promise<GuildMessage>
  send(...[content, options]: SendArgs): Promise<GuildMessage | GuildMessage[]>
}

interface NewsChannel extends D.NewsChannel {
  messages: MessageManager
  send(content: OptionsWithSplit): Promise<GuildMessage[]>
  send(
    options: D.APIMessageContentResolvable | D.MessageAdditions | OptionsNoSplit
  ): Promise<GuildMessage>
  send(
    content: D.StringResolvable,
    options: OptionsWithSplit
  ): Promise<GuildMessage[]>
  send(
    content: D.StringResolvable,
    options: D.MessageAdditions | OptionsNoSplit
  ): Promise<GuildMessage>
  send(...[content, options]: SendArgs): Promise<GuildMessage | GuildMessage[]>
}

interface DMChannel extends D.DMChannel {
  messages: MessageManager
  send(content: OptionsWithSplit): Promise<DMMessage[]>
  send(
    options: D.APIMessageContentResolvable | D.MessageAdditions | OptionsNoSplit
  ): Promise<DMMessage>
  send(
    content: D.StringResolvable,
    options: OptionsWithSplit
  ): Promise<DMMessage[]>
  send(
    content: D.StringResolvable,
    options: D.MessageAdditions | OptionsNoSplit
  ): Promise<DMMessage>
  send(...[content, options]: SendArgs): Promise<DMMessage | DMMessage[]>
}

/** Any text-based guild channel. */
export type TextBasedGuildChannel = NewsChannel | TextChannel
export type TextBasedChannel = DMChannel | TextBasedGuildChannel

export type Channel = D.StoreChannel | D.VoiceChannel | TextBasedChannel

/** A guild from this client. */
export interface Guild extends D.Guild {
  client: Client
  id: Snowflake
  systemChannel: TextChannel | null
  member(user: D.UserResolvable): GuildMember | null
}

/** A message from this client. */
export interface BaseMessage extends D.Message {
  client: Client
  guild: Guild | null
  awaitReactions(
    filter: (
      reaction: D.MessageReaction,
      user: D.User,
      collected?: D.Collection<D.Snowflake, D.MessageReaction>
    ) => boolean,
    options?: D.AwaitReactionsOptions
  ): Promise<D.Collection<D.Snowflake, D.MessageReaction>>
  reply(content: OptionsWithSplit): Promise<this[]>
  reply(
    options: D.APIMessageContentResolvable | D.MessageAdditions | OptionsNoSplit
  ): Promise<this>
  reply(content: D.StringResolvable, options: OptionsWithSplit): Promise<this[]>
  reply(
    content: D.StringResolvable,
    options: D.MessageAdditions | OptionsNoSplit
  ): Promise<this>
  reply(...[content, options]: SendArgs): Promise<this[] | this>
  sendDeletableMessage({
    content,
    reply
  }: {
    content:
      | D.MessageAttachment
      | D.MessageEmbed
      | D.MessageOptions
      | string
      | readonly [
          string | readonly string[],
          (D.MessageAdditions | D.MessageOptions)?
        ]
    reply?: boolean
  }): Promise<void>
}

export interface GuildMember extends D.GuildMember {
  guild: Guild
  // TODO: Fix Discord.js' types (nickname is nullable)
  setNickname(nickname: string | null, reason?: string): Promise<GuildMember>
}

/** A message from a guild. */
export interface GuildMessage extends BaseMessage {
  channel: TextBasedGuildChannel
  guild: Guild
  member: GuildMember
  mentions: D.MessageMentions & {
    readonly members: D.Collection<D.Snowflake, GuildMember>
  }
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

export interface Video {
  title: string
  id: string
  author: string
}

/** A music queue. */
export interface Queue {
  textChannel: TextBasedGuildChannel
  voiceChannel: D.VoiceChannel
  connection: D.VoiceConnection
  songs: Video[]
}
