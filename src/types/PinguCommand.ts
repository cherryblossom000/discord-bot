import type {Message} from 'discord.js'

/** A command. */
export default interface PinguCommand {
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
