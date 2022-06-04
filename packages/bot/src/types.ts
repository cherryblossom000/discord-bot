import type {
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from '@discordjs/builders'
import type {Message} from 'discord.js'
import type {
  GuildMessageContextMenuInteraction,
  GuildSlashCommandInteraction,
  GuildUserContextMenuInteraction,
  MessageContextMenuInteraction,
  SlashCommandInteraction,
  UserContextMenuInteraction
} from './types/discord.js-patches'
import type {Db} from './database'

export * from './types/discord.js-patches'

/** @template T The type of the interaction in `execute`. */
interface CommandBase<T> {
  /**
   * Whether or not the command is only available in a guild.
   * @default false
   */
  guildOnly?: boolean

  /** The actual command. */
  execute: (interaction: T, database: Db) => Promise<void>
}

interface SlashCommandBase<T extends SlashCommandInteraction>
  extends CommandBase<T> {
  /** The data of the slash command for Discord. */
  data:
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder

  /** More docs. */
  usage?: string

  /**
   * Whether or not the command is not shown in the docs.
   * @default false
   */
  hidden?: boolean
}

type GuildOnly<T extends CommandBase<never>> = T & {guildOnly: true}
type GuildOrDM<T extends CommandBase<never>> = T & {guildOnly?: false}

export type GuildOnlySlashCommand = GuildOnly<
  SlashCommandBase<GuildSlashCommandInteraction>
>
export type AnySlashCommand = GuildOrDM<
  SlashCommandBase<SlashCommandInteraction>
>
export type SlashCommand = AnySlashCommand | GuildOnlySlashCommand

interface ContextMenuCommandBase<T> extends CommandBase<T> {
  name: string
}

export type GuildOnlyMessageContextMenuCommand = GuildOnly<
  ContextMenuCommandBase<GuildMessageContextMenuInteraction>
>
export type AnyMessageContextMenuCommand = GuildOrDM<
  ContextMenuCommandBase<MessageContextMenuInteraction>
>
export type MessageContextMenuCommand =
  | AnyMessageContextMenuCommand
  | GuildOnlyMessageContextMenuCommand

type GuildOnlyUserContextMenuCommand = GuildOnly<
  ContextMenuCommandBase<GuildUserContextMenuInteraction>
>
export type AnyUserContextMenuCommand = GuildOrDM<
  ContextMenuCommandBase<UserContextMenuInteraction>
>
export type UserContextMenuCommand =
  | AnyUserContextMenuCommand
  | GuildOnlyUserContextMenuCommand

export type ContextMenuCommand =
  | MessageContextMenuCommand
  | UserContextMenuCommand

export type Command = ContextMenuCommand | SlashCommand

/** Something that is triggered based on a regular expression. */
export interface Trigger {
  /** The regex to test for. */
  regex: RegExp

  /** The message to reply with. Can be a function that returns the message.. */
  message: string | ((message: Message) => Promise<string> | string)
}
