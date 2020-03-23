import Discord, {Collection} from 'discord.js'
import type {
  APIMessage, GuildMember, MessageAdditions, MessageOptions,
  SplitOptions, StringResolvable, TextChannel
} from 'discord.js'
import type Keyv from 'keyv'

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

  /**
   * Whether or not the command is only available in a server.
   * @default false
   */
  guildOnly?: false

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

  /**
   * The actual command.
   * @param message The message.
   * @param args The arguments.
   */
  execute(message: T, args: string[], prefixes: Keyv<string>): Promise<void>
}

/**
 * A command.
 * @template T Whether the command is guild only or not.
 */
export type Command<T extends boolean = false> = T extends true
  ? CommandBase<GuildMessage> & {guildOnly: true}
  : CommandBase<Message>

/** A command that is triggered based on a regular expression. */
export interface RegexCommand {
  /** The regex to test for. */
  regex: RegExp

  /** The message to reply with. Can be a function that returns the message.. */
  regexMessage: string | ((message: Message) => string)
}

/** The Discord client for this bot. */
export class Client extends Discord.Client {
  /** The commands. */
  commands = new Collection<string, Command>()

  /** The regex commands. */
  regexCommands = new Collection<RegExp, RegexCommand['regexMessage']>()

  /** Set the activity. */
  setActivity(): void {
    this.user!.setActivity(`capitalist scum in ${this.guilds.cache.size} servers`, {type: 'WATCHING'})
  }
}

type OptionsNoSplit = MessageOptions & {split?: false}
type OptionsWithSplit = MessageOptions & {split: true | SplitOptions}

/** A message from this client. */
export interface Message extends Discord.Message {
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
export interface GuildMessage extends Message {
  channel: TextChannel
  guild: Guild
  member: GuildMember
}

/** A guild from this client. */
export interface Guild extends Discord.Guild {client: Client}
