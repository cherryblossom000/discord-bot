import {Client, Collection} from 'discord.js'
import type {Message} from 'discord.js'

/** A command. */
export interface PinguCommand {
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
  guildOnly?: boolean

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
  execute(message: Message, args: string[]): void
}

/** A command that is triggered based on a regular expression. */
export interface PinguRegexCommand {
  /**
   * The regex to test for.
   * If present, either `regexMessage` or `execute` must be defined.
   * If absent, `execute` must be defined.
   */
  regex?: RegExp

  /**
   * The message to reply with.
   * If present, `regex` must be defined.
   * If absent, `execute` must be defined.
   */
  regexMessage?: string

  /**
   * The actual command. Will only run if `regexMessage` or `regex` is not present.
   * If absent, `regex` and `regexMessage` must be defined.
   */
  execute?: (message: Message) => void
}

/** The Discord client for this bot. */
export class PinguClient extends Client {
  /** The commands. */
  commands = new Collection<string, PinguCommand>()

  /** Set the activity. */
  setActivity(): void {
    this.user!.setActivity(`capitalist scum in ${this.guilds.cache.size} servers`, {type: 'WATCHING'})
  }
}
