import type {
  APIMessage,
  APIMessageContentResolvable,
  AwaitReactionsOptions,
  Collection,
  DMChannel as DiscordDMChannel,
  Guild as DiscordGuild,
  GuildMember,
  MessageAdditions,
  Message as DiscordMessage,
  MessageAttachment,
  MessageEmbed,
  MessageMentions,
  MessageOptions,
  MessageReaction,
  NewsChannel as DiscordNewsChannel,
  Snowflake,
  SplitOptions,
  StringResolvable,
  TextChannel as DiscordTextChannel,
  User,
  VoiceChannel,
  VoiceConnection
} from 'discord.js'
import type {Db} from './database'
import type Client from './Client'

// Make send return custom Message
interface TextChannel extends DiscordTextChannel {
  send(content: OptionsWithSplit): Promise<GuildMessage[]>
  send(
    options: APIMessageContentResolvable | OptionsNoSplit | MessageAdditions
  ): Promise<GuildMessage>
  send(
    content: StringResolvable,
    options: OptionsWithSplit
  ): Promise<GuildMessage[]>
  send(
    content: StringResolvable,
    options: OptionsNoSplit | MessageAdditions
  ): Promise<GuildMessage>
  send(...[content, options]: SendArgs): Promise<GuildMessage | GuildMessage[]>
}

interface NewsChannel extends DiscordNewsChannel {
  send(content: OptionsWithSplit): Promise<GuildMessage[]>
  send(
    options: APIMessageContentResolvable | OptionsNoSplit | MessageAdditions
  ): Promise<GuildMessage>
  send(
    content: StringResolvable,
    options: OptionsWithSplit
  ): Promise<GuildMessage[]>
  send(
    content: StringResolvable,
    options: OptionsNoSplit | MessageAdditions
  ): Promise<GuildMessage>
  send(...[content, options]: SendArgs): Promise<GuildMessage | GuildMessage[]>
}

interface DMChannel extends DiscordDMChannel {
  send(content: OptionsWithSplit): Promise<DMMessage[]>
  send(
    options: APIMessageContentResolvable | OptionsNoSplit | MessageAdditions
  ): Promise<DMMessage>
  send(
    content: StringResolvable,
    options: OptionsWithSplit
  ): Promise<DMMessage[]>
  send(
    content: StringResolvable,
    options: OptionsNoSplit | MessageAdditions
  ): Promise<DMMessage>
  send(...[content, options]: SendArgs): Promise<DMMessage | DMMessage[]>
}

/** Any text-based guild channel. */
// eslint-disable-next-line import/no-unused-modules -- it is used
export type TextBasedGuildChannel = TextChannel | NewsChannel
export type TextBasedChannel = TextBasedGuildChannel | DMChannel

/** A guild from this client. */
export interface Guild extends DiscordGuild {
  client: Client
  systemChannel: TextChannel | null
}

export type OptionsNoSplit = MessageOptions & {split?: false}
export type OptionsWithSplit = MessageOptions & {split: true | SplitOptions}

export type SendArgs =
  | [
      | APIMessageContentResolvable
      | MessageOptions
      | MessageAdditions
      | APIMessage
    ]
  | [APIMessageContentResolvable, (MessageOptions | MessageAdditions)?]
  | [StringResolvable, MessageOptions | MessageAdditions]

/** A message from this client. */
interface BaseMessage extends DiscordMessage {
  client: Client
  guild: Guild | null
  awaitReactions(
    filter: (
      reaction: MessageReaction,
      user: User,
      collected?: Collection<Snowflake, MessageReaction>
    ) => boolean,
    options?: AwaitReactionsOptions
  ): Promise<Collection<Snowflake, MessageReaction>>
  reply(content: OptionsWithSplit): Promise<this[]>
  reply(
    options: APIMessageContentResolvable | OptionsNoSplit | MessageAdditions
  ): Promise<this>
  reply(content: StringResolvable, options: OptionsWithSplit): Promise<this[]>
  reply(
    content: StringResolvable,
    options: OptionsNoSplit | MessageAdditions
  ): Promise<this>
  reply(...[content, options]: SendArgs): Promise<this | this[]>
  sendDeletableMessage({
    content,
    reply
  }: {
    content:
      | MessageOptions
      | MessageEmbed
      | MessageAttachment
      | string
      | readonly [
          string | readonly string[],
          (MessageOptions | MessageAdditions)?
        ]
    reply?: boolean
  }): Promise<void>
}

/** A message from a guild. */
export interface GuildMessage extends BaseMessage {
  channel: TextBasedGuildChannel
  guild: Guild
  member: GuildMember
  mentions: MessageMentions & {
    readonly members: Collection<Snowflake, GuildMember>
  }
}

/** A message from a DM. */
interface DMMessage extends BaseMessage {
  channel: DMChannel
  guild: null
  member: null
}

/** A message from this client. */
export type Message = GuildMessage | DMMessage

/* eslint-disable jsdoc/valid-types -- description for template */
/** @template T The type of the message in `execute`. */
/* eslint-enable jsdoc/valid-types -- see above */
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
   * Whether or nor the command requires arguments.
   * @default false
   */
  args?: boolean

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
  ): void | Promise<void>
}

/* eslint-disable jsdoc/valid-types -- description for template */
/**
 * A command.
 * @template T Whether the command is guild only or not.
 */
/* eslint-enable jsdoc/valid-types -- see above */
export type Command<T extends boolean = false> = T extends true
  ? CommandBase<GuildMessage> & {guildOnly: true}
  : CommandBase<GuildMessage | DMMessage> & {guildOnly?: false}

/** A command that is triggered based on a regular expression. */
export interface RegexCommand {
  /** The regex to test for. */
  regex: RegExp

  /** The message to reply with. Can be a function that returns the message.. */
  regexMessage: string | ((message: Message) => string)
}

// eslint-disable-next-line import/no-unused-modules -- it is used
export interface Video {
  title: string
  id: string
  author: string
}

/** A music queue. */
export interface Queue {
  textChannel: TextBasedGuildChannel
  voiceChannel: VoiceChannel
  connection: VoiceConnection
  songs: Video[]
}
