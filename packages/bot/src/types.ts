import type {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders'
import type {APIApplicationCommandPermission} from 'discord-api-types-updated/v9'
import type {MessageAttachment} from 'discord.js'
import type {
  SlashCommandInteraction,
  ContextMenuInteraction,
  GuildSlashCommandInteraction,
  Message
} from './types/discord.js-patches'
import type {Db} from './database'
import type {NonEmpty} from './utils'

export * from './types/discord.js-patches'

/** @template T The type of the interaction in `execute`. */
interface CommandBase<T> {
  /**
   * Whether or not the command is only available in a guild.
   * @default false
   */
  guildOnly?: boolean

  /** The actual command. */
  execute(interaction: T, database: Db): Promise<void> | void
}

interface SlashCommandBase<T extends SlashCommandInteraction>
  extends CommandBase<T> {
  /** The data of the slash command for Discord. */
  data:
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder

  /** The permissions for the command. */
  permissions?: NonEmpty<APIApplicationCommandPermission>

  /** More docs. */
  usage?: string

  /**
   * Whether or not the command is not shown in the docs.
   * @default false
   */
  hidden?: boolean
}

type GuildOnly<T extends CommandBase<unknown>> = T & {guildOnly: true}
type GuildOrDM<T extends CommandBase<unknown>> = T & {guildOnly?: false}

export type GuildOnlySlashCommand = GuildOnly<
  SlashCommandBase<GuildSlashCommandInteraction>
>
export type AnySlashCommand = GuildOrDM<
  SlashCommandBase<SlashCommandInteraction>
>
export type SlashCommand = AnySlashCommand | GuildOnlySlashCommand

interface ContextMenuCommandBase extends CommandBase<ContextMenuInteraction> {
  name: string
}

export type GuildOnlyContextMenuCommand = GuildOnly<ContextMenuCommandBase>
export type AnyContextMenuCommand = GuildOrDM<ContextMenuCommandBase>
export type ContextMenuCommand =
  | AnyContextMenuCommand
  | GuildOnlyContextMenuCommand

/** Something that is triggered based on a regular expression. */
export interface Trigger {
  /** The regex to test for. */
  regex: RegExp

  /** The message to reply with. Can be a function that returns the message.. */
  message: string | ((message: Message) => string)
}

export type RotateAttachment = Pick<MessageAttachment, 'name' | 'url'>
