import {Client, Collection} from 'discord.js'
import type {Message} from 'discord.js'

/** A command. */
export interface Command {
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
  execute(message: PinguMessage, args: string[]): void
}

/** A command that is triggered based on a regular expression. */
export interface RegexCommand {
  /** The regex to test for. */
  regex: RegExp

  /** The message to reply with. Can be a function that returns the message.. */
  regexMessage: string | ((message: Message) => string)
}

/** The Discord client for this bot. */
export class PinguClient extends Client {
  /** The commands. */
  commands = new Collection<string, Command>()

  /** Set the activity. */
  setActivity(): void {
    this.user!.setActivity(`capitalist scum in ${this.guilds.cache.size} servers`, {type: 'WATCHING'})
  }
}

/** A message from this client. */
export interface PinguMessage extends Message {
  client: PinguClient
}
