import Discord, {Collection, Structures} from 'discord.js'
import upperFirst from 'lodash.upperfirst'
import type {
  APIMessage, ClientEvents, DMChannel, GuildMember, MessageAdditions, MessageMentions, MessageOptions,
  NewsChannel, Snowflake, SplitOptions, StringResolvable, TextChannel, VoiceChannel, VoiceConnection
} from 'discord.js'
import type Keyv from 'keyv'

/** Any text-based guild channel. */
export type TextBasedGuildChannel = TextChannel | NewsChannel

/** A guild's entry in the database. */
export interface DatabaseGuild {
  /** A custom prefix. */
  prefix?: string

  /** The volume for playing music. */
  volume?: number
}

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
  execute(message: T, input: {args: string[], input: string}, database: Keyv<DatabaseGuild>): void | Promise<void>
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

/** The Discord client for this bot. */
export class Client extends Discord.Client {
  declare on: <K extends keyof ClientEvents>(
    event: K, listener: (...args: (ClientEvents & {message: [Message]})[K]) => void
  ) => this

  /** The commands. */
  readonly commands: Collection<string, Command<boolean>>

  /** The regex commands. */
  readonly regexCommands: Collection<RegExp, RegexCommand['regexMessage']>

  /** The music queue for each guild. */
  readonly queues: Collection<Snowflake, Queue>

  constructor(...args: ConstructorParameters<typeof Discord.Client>) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Structures.extend('Message', Message => class extends Message {
      // TODO: Fix Discord.js' types of reply and send (1st overload) because it sues MessageAdditions twice in options param
      async reply(content?: StringResolvable, options?: MessageOptions | MessageAdditions | OptionsNoSplit): Promise<this>
      async reply(content?: StringResolvable, options?: MessageAdditions | OptionsWithSplit): Promise<this[]>
      async reply(options?: APIMessage | MessageOptions | MessageAdditions | OptionsNoSplit): Promise<this>
      async reply(options?: APIMessage | MessageAdditions | OptionsWithSplit): Promise<this[]>
      async reply(content?: StringResolvable, options?: MessageOptions | MessageAdditions): Promise<this | this[]> {
        return super.reply(
          this.guild
            ? content
            : Array.isArray(content) ? (content[0] = upperFirst(content[0]), content) : upperFirst(content),
          options
        ) as Promise<this | this[]>
      }
    })
    super(...args)
    // These can't be stored properties otherwise I can't extend structures before calling super
    this.commands = new Collection<string, Command<boolean>>()
    this.regexCommands = new Collection<RegExp, RegexCommand['regexMessage']>()
    this.queues = new Collection<Snowflake, Queue>()
  }

  /** Set the activity. */
  setActivity(): void {
    this.user!.setActivity(`capitalist scum in ${this.guilds.cache.size} servers`, {type: 'WATCHING'})
  }
}

export type OptionsNoSplit = MessageOptions & {split?: false}
export type OptionsWithSplit = MessageOptions & {split: true | SplitOptions}

/** A message from this client. */
interface BaseMessage extends Discord.Message {
  client: Client
  guild: Guild | null
  reply(
    content?: StringResolvable,
    options?: MessageAdditions | MessageOptions | OptionsNoSplit,
  ): Promise<this>
  reply(content?: StringResolvable, options?: MessageAdditions | OptionsWithSplit): Promise<this[]>
  reply(options?: APIMessage | MessageOptions | MessageAdditions | OptionsNoSplit): Promise<this>
  reply(options?: APIMessage | MessageAdditions | OptionsWithSplit): Promise<this[]>
}

/** A message from a guild. */
export interface GuildMessage extends BaseMessage {
  channel: TextBasedGuildChannel
  guild: Guild
  member: GuildMember
  mentions: MessageMentions & {readonly members: Collection<Snowflake, GuildMember>}
}

/** A message from a DM. */
export interface DMMessage extends BaseMessage {
  channel: DMChannel
  guild: null
  member: null
}

/** A message from this client. */
export type Message = GuildMessage | DMMessage

/** A guild from this client. */
export interface Guild extends Discord.Guild {
  client: Client
}
