import type {
  APIMessage, Collection, DMChannel, Guild as DiscordGuild, GuildMember, MessageAdditions, Message as DiscordMessage,
  MessageMentions, MessageOptions, NewsChannel, Snowflake, SplitOptions, StringResolvable, TextChannel, VoiceChannel,
  VoiceConnection
} from 'discord.js'
import type {Db} from './database'
import type Client from './Client'

/** Any text-based guild channel. */
// eslint-disable-next-line import/no-unused-modules -- it is used
export type TextBasedGuildChannel = TextChannel | NewsChannel

/** @template T The type of the message in `execute`. */
interface CommandBase<T extends Message> {
  /** The name. */
  name: string

  /**
   * Aliases.
   * @default []
   */
  aliases?: string[]

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
   * The cooldown.
   * @default 3
   */
  cooldown?: number

  /** The actual command. */
  execute(message: T, input: {args: string[], input: string}, database: Db): void | Promise<void>
}

/**
 * A command.
 * @template T Whether the command is guild only or not.
 */
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

export type OptionsNoSplit = MessageOptions & {split?: false}
export type OptionsWithSplit = MessageOptions & {split: true | SplitOptions}

/** A message from this client. */
interface BaseMessage extends DiscordMessage {
  client: Client
  guild: Guild | null
  reply(
    content?: StringResolvable,
    options?: MessageAdditions | MessageOptions | OptionsNoSplit,
  ): Promise<this>
  reply(content?: StringResolvable, options?: MessageAdditions | OptionsWithSplit): Promise<this[]>
  reply(options?: APIMessage | MessageOptions | MessageAdditions | OptionsNoSplit): Promise<this>
  reply(options?: APIMessage | MessageAdditions | OptionsWithSplit): Promise<this[]>
  sendDeletableMessage(
    {reply, content}: {
      reply?: boolean
      content: MessageOptions | MessageAdditions | any | [any, (MessageOptions | MessageAdditions)?]
    }
  ): Promise<void>
}

/** A message from a guild. */
export interface GuildMessage extends BaseMessage {
  channel: TextBasedGuildChannel
  guild: Guild
  member: GuildMember
  mentions: MessageMentions & {readonly members: Collection<Snowflake, GuildMember>}
}

/** A message from a DM. */
interface DMMessage extends BaseMessage {
  channel: DMChannel
  guild: null
  member: null
}

/** A message from this client. */
export type Message = GuildMessage | DMMessage

/** A guild from this client. */
export interface Guild extends DiscordGuild {
  client: Client
}
